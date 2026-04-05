"""
VitCare AI — agents/planner.py
PlannerAgent: decides whether to use RAG retriever, direct LLM, or booking agent.
"""

from app.core.state import AgentState

# ── Medical Keywords ───────────────────────────────────────────────────────────
MEDICAL_KEYWORDS = [
    # Symptoms
    "fever", "pain", "headache", "nausea", "vomiting", "diarrhea", "cough",
    "acne", "pimple", "skin", "rash", "itch", "cold", "flu",
    "shortness of breath", "chest pain", "abdominal pain", "back pain",
    "joint pain", "muscle pain", "fatigue", "weakness", "dizziness",
    "confusion", "memory loss", "seizure", "numbness", "tingling", "swelling",
    "bleeding", "bruising", "weight loss", "weight gain",
    "appetite loss", "sleep problems", "insomnia",
    # Conditions
    "cancer", "diabetes", "hypertension", "heart disease", "stroke", "asthma",
    "copd", "pneumonia", "bronchitis", "covid", "coronavirus",
    "infection", "virus", "bacteria", "fungal", "arthritis", "osteoporosis",
    "thyroid", "kidney disease", "liver disease", "hepatitis", "depression",
    "anxiety", "bipolar", "schizophrenia", "alzheimer", "parkinson", "epilepsy",
    # Medical terms
    "treatment", "therapy", "medication", "medicine", "prescription", "dosage",
    "side effects", "diagnosis", "prognosis", "surgery", "operation",
    "procedure", "test", "lab results", "blood test", "x-ray", "mri",
    "ct scan", "ultrasound", "biopsy", "screening", "prevention", "vaccine",
    "immunization", "rehabilitation", "recovery", "chronic", "acute",
    "syndrome", "disorder", "symptom", "cure", "remedy", "doctor", "hospital",
    # Body parts
    "heart", "lung", "kidney", "liver", "brain", "stomach", "intestine",
    "blood", "bone", "muscle", "nerve", "eye", "ear", "throat",
    "neck", "spine", "joint", "head", "chest", "abdomen", "leg", "arm",
]

# ── Booking Intent Keywords ────────────────────────────────────────────────────
BOOKING_KEYWORDS = [
    "book", "appointment", "schedule", "available doctor", "find doctor",
    "consult", "see a doctor", "visit doctor",
]

# ── Appointment Management Keywords ─────────────────────────────────────────────
VIEW_APPOINTMENTS_KEYWORDS = [
    "my appointment", "my appointments", "show appointment", "list appointment", 
    "upcoming appointment", "view appointment", "what appointments", "scheduled appointment",
    "check appointment"
]

CANCEL_APPOINTMENT_KEYWORDS = [
    "cancel appointment", "delete appointment", "remove appointment"
]


def PlannerAgent(state: AgentState) -> AgentState:
    """Decide whether to use RAG retriever, direct LLM, or booking agent."""
    question = state["question"].lower()
    booking_phase = state.get("booking_phase", "idle")

    # ── Handle awaiting_booking_consent (user responding yes/no to auto-suggest) ─
    if booking_phase == "awaiting_booking_consent":
        if question in ("yes", "yeah", "sure", "ok", "okay", "y", "please", "yep"):
            state["current_tool"] = "booking_agent"
            state["booking_phase"] = "recommending"
            state["retry_count"] = 0
            return state
        elif question in ("no", "nope", "nah", "n", "later", "not now", "no thanks", "cancel"):
            # Explicit decline — reset to idle so they can chat normally again
            state["booking_phase"] = "idle"
            state["booking_suggested"] = False
            # Fall through to normal routing below
        else:
            # User gave more info / a question — keep the consent pending,
            # route to normal LLM/RAG to answer them, without re-suggesting booking
            state["current_tool"] = "retriever" if any(kw in question for kw in MEDICAL_KEYWORDS) else "llm_agent"
            state["retry_count"] = 0
            return state

    # ── If we're in an active appointment flow, continue it ────────────────
    appointment_phase = state.get("appointment_phase", "idle")
    if appointment_phase not in ("idle", None):
        state["current_tool"] = "appointment_agent"
        state["retry_count"] = 0
        return state

    # ── If we're in an active booking flow, continue it ────────────────────
    if booking_phase not in ("idle", None, "awaiting_booking_consent"):
        state["current_tool"] = "booking_agent"
        state["retry_count"] = 0
        return state

    # ── Check for explicit booking intent ──────────────────────────────────
    # First, handle viewing or canceling, since "appointment" is a booking keyword too
    
    is_cancel = any(kw in question for kw in ["cancel", "delete", "remove", "drop"])
    is_view = any(kw in question for kw in ["view", "show", "what", "list", "my", "check", "upcoming"])
    has_appt = any(kw in question for kw in ["appointment", "appointments", "booking", "schedule"])

    if is_cancel and has_appt:
        state["current_tool"] = "appointment_agent"
        state["appointment_phase"] = "canceling"
        state["retry_count"] = 0
        return state

    if is_view and has_appt:
        state["current_tool"] = "appointment_agent"
        state["appointment_phase"] = "viewing"
        state["retry_count"] = 0
        return state

    if any(kw in question for kw in BOOKING_KEYWORDS):
        state["current_tool"] = "booking_agent"
        state["booking_phase"] = "recommending"
        state["retry_count"] = 0
        return state

    # ── Default: medical vs general routing ────────────────────────────────
    contains_medical = any(kw in question for kw in MEDICAL_KEYWORDS)
    state["current_tool"] = "retriever" if contains_medical else "llm_agent"
    state["retry_count"] = 0
    return state

