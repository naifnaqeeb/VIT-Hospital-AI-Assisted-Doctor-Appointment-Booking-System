"""
VitCare AI — agents/executor.py
ExecutorAgent: synthesizes the final response using the LLM and gathered context.

Diagnostic conversation flow:
  Turn 1  → Ask 2-3 follow-up questions only
  Turn 2  → Suggest possible causes + ask for any remaining symptoms
  Turn 3+ → Full diagnosis + recommend specialist + offer booking
  EMERGENCY (any turn) → Skip turns, recommend specialist immediately
"""

from app.core.logging_config import logger
from app.core.state import AgentState
from app.tools.llm_client import get_llm
from app.tools.speciality_mapper import map_symptoms_to_speciality

# ── Emergency keywords that bypass the turn counter ───────────────────────────
_EMERGENCY_KEYWORDS = [
    "can't breathe", "cannot breathe", "not breathing", "heart attack",
    "chest pain", "stroke", "unconscious", "unresponsive", "severe bleeding",
    "heavy bleeding", "overdose", "suicidal", "suicide", "seizure",
    "extreme pain", "collapsed", "fainting", "fainted", "anaphylaxis",
    "allergic reaction", "choking",
]


def _is_emergency(text: str) -> bool:
    t = text.lower()
    return any(kw in t for kw in _EMERGENCY_KEYWORDS)


def _is_symptom_based(question: str) -> bool:
    """Check if the user's question describes symptoms (not just a factual query)."""
    symptom_indicators = [
        "i have", "i feel", "i am having", "i'm having", "i got",
        "my ", "suffering", "experiencing", "hurts", "ache", "aching",
        "painful", "sore", "burning", "swollen", "itchy", "bleeding",
        "since", "started", "days ago", "week ago",
    ]
    q = question.lower()
    return any(indicator in q for indicator in symptom_indicators)


def _build_context(state: AgentState) -> str:
    """Build a formatted string of recent conversation history."""
    history_context = ""
    for item in state.get("conversation_history", [])[-6:]:
        if item.get("role") == "user":
            history_context += f"Patient: {item.get('content', '')}\n"
        elif item.get("role") == "assistant":
            history_context += f"Doctor: {item.get('content', '')}\n"
    return history_context


def _generate_answer(llm, prompt: str, fallback: str) -> str:
    """Run LLM and return the answer, falling back gracefully on error."""
    try:
        response = llm.invoke(prompt)
        answer = (
            response.content.strip()
            if hasattr(response, "content")
            else str(response).strip()
        )
        return answer if len(answer) > 10 else fallback
    except Exception as e:
        logger.error("Executor: LLM generation failed: %s", str(e))
        return fallback


def ExecutorAgent(state: AgentState) -> AgentState:
    """Synthesize the final patient response using a multi-turn diagnostic flow."""
    llm = get_llm()
    question = state["question"]
    source_info = state.get("source", "Unknown")
    history_context = _build_context(state)

    symptom_turn = state.get("symptom_turn_count", 0)
    booking_suggested = state.get("booking_suggested", False)
    is_symptom_msg = _is_symptom_based(question)
    is_emergency = _is_emergency(question)

    # Once the user has given at least one symptom message, ALL follow-up
    # messages continue the diagnostic flow (even "yes it gets worse", etc.)
    in_diagnostic_flow = (symptom_turn >= 1) or is_symptom_msg

    # Retrieve any RAG / fallback documents
    doc_content = ""
    if state.get("documents") and len(state["documents"]) > 0:
        doc_content = "\n\n".join(
            [doc.page_content[:800] for doc in state["documents"][:3]]
        )

    # ── LLM unavailable ───────────────────────────────────────────────────────
    if not llm:
        answer = (
            "Medical AI service temporarily unavailable. "
            "Please consult a healthcare professional."
        )
        source_info = "System Message"

    # ── EMERGENCY: skip turns, respond immediately ─────────────────────────────
    elif is_emergency:
        fallback = (
            "⚠️ This sounds like a medical emergency. Please call emergency services "
            "or go to the nearest ER immediately."
        )
        doc_section = f"\n\nMedical Reference:\n{doc_content}" if doc_content else ""
        prompt = (
            "You are an emergency medical assistant. The patient has described emergency symptoms.\n\n"
            f"Previous Conversation:\n{history_context}\n"
            f"Patient Emergency Message:\n{question}{doc_section}\n\n"
            "Respond urgently in 2-3 sentences: acknowledge the emergency, urge them to call "
            "emergency services or go to the ER immediately, and provide one key safety instruction."
        )
        answer = _generate_answer(llm, prompt, fallback)
        # Still recommend specialist so they can follow up
        speciality = map_symptoms_to_speciality(question + " " + answer)
        state["diagnosed_speciality"] = speciality
        answer += (
            f"\n\n---\n"
            f"🏥 After getting emergency care, follow up with a **{speciality}**. "
            f"Would you like me to find available doctors? (Reply **yes** or **no**)"
        )
        state["booking_suggested"] = True
        state["booking_phase"] = "awaiting_booking_consent"
        state["symptom_turn_count"] = symptom_turn + 1

    # ── TURN 1: Ask follow-up questions only ──────────────────────────────────
    elif is_symptom_msg and symptom_turn == 0 and not booking_suggested:
        fallback = (
            "I hear you. To better understand your condition, could you tell me: "
            "How long have you been experiencing this? Is the discomfort constant or does it come and go? "
            "Do you have any other accompanying symptoms?"
        )
        doc_section = f"\n\nMedical Reference:\n{doc_content}" if doc_content else ""
        prompt = (
            "You are a compassionate medical AI assistant conducting an initial symptom assessment.\n\n"
            f"Previous Conversation:\n{history_context}\n"
            f"Patient's Symptom:\n{question}{doc_section}\n\n"
            "Your task on this FIRST message:\n"
            "1. Briefly acknowledge the patient's symptom with empathy (1 sentence).\n"
            "2. Ask exactly 2-3 focused follow-up questions to gather more detail "
            "(duration, severity, location, accompanying symptoms).\n"
            "Do NOT suggest a diagnosis or recommend a doctor yet. "
            "Keep the response concise and conversational."
        )
        answer = _generate_answer(llm, prompt, fallback)
        state["symptom_turn_count"] = symptom_turn + 1
        logger.info("Executor: Turn 1 — gathering symptoms")

    # ── TURN 2: Suggest possible causes, gather remaining symptoms ─────────────
    elif in_diagnostic_flow and symptom_turn == 1 and not booking_suggested:
        fallback = (
            "Based on what you've described, the symptoms could be related to several conditions. "
            "Are there any other symptoms you've noticed that might help narrow things down?"
        )
        doc_section = f"\n\nMedical Reference:\n{doc_content}" if doc_content else ""
        prompt = (
            "You are a compassionate medical AI assistant conducting a second-round symptom assessment.\n\n"
            f"Previous Conversation:\n{history_context}\n"
            f"Patient's Latest Message:\n{question}{doc_section}\n\n"
            "Your task on this SECOND message:\n"
            "1. Briefly summarise the symptoms you've gathered so far (1 sentence).\n"
            "2. Suggest 2-3 possible causes or conditions that could explain the symptoms — "
            "be informative but reassuring.\n"
            "3. Ask one final clarifying question if needed.\n"
            "Do NOT yet recommend a doctor or specialist. "
            "Keep it conversational and professional."
        )
        answer = _generate_answer(llm, prompt, fallback)
        state["symptom_turn_count"] = symptom_turn + 1
        logger.info("Executor: Turn 2 — suggesting possible causes")

    # ── TURN 3+: Full diagnosis + recommend specialist ─────────────────────────
    elif in_diagnostic_flow and symptom_turn >= 2 and not booking_suggested:
        fallback = (
            "Based on all the symptoms you've described, I recommend consulting a specialist "
            "who can properly evaluate your condition."
        )
        doc_section = f"\n\nMedical Reference:\n{doc_content}" if doc_content else ""
        prompt = (
            "You are a compassionate medical AI assistant delivering a final diagnostic assessment.\n\n"
            f"Previous Conversation:\n{history_context}\n"
            f"Patient's Latest Message:\n{question}{doc_section}\n\n"
            "Your task:\n"
            "1. Summarise the full picture of symptoms collected across the conversation.\n"
            "2. Provide a likely diagnosis or differential diagnoses (2-3 possibilities).\n"
            "3. Provide 1-2 practical self-care tips while they wait for a doctor.\n"
            "4. State clearly that they should see a specialist (do not name the specialty yet — "
            "that will be appended automatically).\n"
            "Keep it clear, professional, caring, and under 150 words."
        )
        answer = _generate_answer(llm, prompt, fallback)

        # Append specialist recommendation
        all_symptoms = question + " " + history_context + " " + answer
        speciality = map_symptoms_to_speciality(all_symptoms)
        state["diagnosed_speciality"] = speciality
        answer += (
            f"\n\n---\n"
            f"🏥 Based on your symptoms, I recommend consulting a **{speciality}**. "
            f"Would you like me to find available doctors for you? (Reply **yes** or **no**)"
        )
        state["booking_suggested"] = True
        state["booking_phase"] = "awaiting_booking_consent"
        state["symptom_turn_count"] = symptom_turn + 1
        logger.info("Executor: Turn 3+ — full diagnosis + specialist recommendation (%s)", speciality)

    # ── Non-symptom question OR booking already suggested ─────────────────────
    elif state.get("llm_success") and state.get("generation"):
        answer = state["generation"]
        logger.info("Executor: Using pre-generated LLM response")

    elif doc_content:
        prompt = (
            "You are an experienced medical doctor providing helpful consultation.\n\n"
            f"Previous Conversation:\n{history_context}\n"
            f"Patient's Current Question:\n{question}\n\n"
            f"Medical Information:\n{doc_content}\n\n"
            "Provide a clear, caring response in 2-4 sentences. Be professional and reassuring."
        )
        answer = _generate_answer(
            llm,
            prompt,
            "I understand your concern. For accurate medical advice, please consult a healthcare professional.",
        )
        logger.info("Executor: Generated response from documents")

    else:
        answer = (
            "I understand your concern about your symptoms. For accurate medical advice, "
            "please consult with a healthcare professional who can properly evaluate your condition."
        )
        source_info = "System Message"

    state["generation"] = answer
    state["source"] = source_info
    state["conversation_history"].append({"role": "user", "content": question})
    state["conversation_history"].append(
        {"role": "assistant", "content": answer, "source": source_info}
    )
    return state
