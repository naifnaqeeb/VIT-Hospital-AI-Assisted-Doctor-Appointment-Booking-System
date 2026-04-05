"""
VitCare AI — agents/booking_agent.py
BookingAgent: LangGraph node that orchestrates the doctor recommendation
and appointment booking flow as a multi-turn conversation state machine.
"""

import asyncio

from app.core.logging_config import logger
from app.core.state import AgentState
from app.tools.booking_tool import (
    book_appointment,
    format_slot_options,
    generate_available_slots,
)
from app.tools.doctor_tool import fetch_available_doctors, format_doctor_list
from app.tools.speciality_mapper import map_symptoms_to_speciality


def BookingAgent(state: AgentState) -> AgentState:
    """
    Multi-phase booking state machine.

    Phases:
        idle         → diagnosis just happened, suggest booking
        recommending → fetch and display doctors for the diagnosed speciality
        selecting_doctor → user picks a doctor number
        selecting_slot   → user picks a time slot
        confirming       → book the appointment and confirm
    """
    phase = state.get("booking_phase", "idle")
    question = state.get("question", "").strip().lower()

    logger.info("BookingAgent: phase=%s, input='%s'", phase, question[:50])

    # ── Phase: RECOMMENDING — Fetch doctors and show list ──────────────────
    if phase == "recommending":
        speciality = state.get("diagnosed_speciality") or None

        # If no speciality was diagnosed yet (user jumped straight to booking),
        # try to infer it from the conversation history
        if not speciality:
            from app.tools.speciality_mapper import map_symptoms_to_speciality
            history_text = " ".join(
                item.get("content", "")
                for item in state.get("conversation_history", [])
                if item.get("role") == "user"
            )
            speciality = map_symptoms_to_speciality(history_text)
            state["diagnosed_speciality"] = speciality

        # Fetch doctors synchronously
        try:
            doctors = fetch_available_doctors(speciality)
        except Exception as e:
            logger.error("BookingAgent: Failed to fetch doctors: %s", str(e))
            doctors = []

        if doctors:
            state["available_doctors"] = doctors
            state["generation"] = format_doctor_list(doctors)
            state["booking_phase"] = "selecting_doctor"
            state["source"] = "Doctor Recommendation"
        else:
            state["generation"] = (
                f"I couldn't find any available {speciality} doctors at the moment. "
                "You can try again later or visit the hospital website to book manually."
            )
            state["booking_phase"] = "idle"
            state["source"] = "Booking System"

        _append_history(state)
        return state

    # ── Phase: SELECTING_DOCTOR — User picks a doctor by number ───────────
    if phase == "selecting_doctor":
        # Check for skip/cancel
        if question in ("skip", "no", "cancel", "later"):
            state["generation"] = "No problem! Feel free to ask me anything else or book an appointment later."
            state["booking_phase"] = "idle"
            state["source"] = "Booking System"
            _append_history(state)
            return state

        # Try to parse doctor number
        doctors = state.get("available_doctors", [])
        try:
            choice = int(question.strip().replace(".", ""))
            if 1 <= choice <= len(doctors):
                selected = doctors[choice - 1]
                state["selected_doctor"] = selected

                # Generate available slots
                slots = generate_available_slots(selected)
                state["_available_slots"] = slots  # temp storage for slot lookup

                state["generation"] = (
                    f"Great choice! You selected **{selected['name']}** "
                    f"({selected['degree']}, {selected['experience']} experience, ₹{selected['fees']} fee).\n\n"
                    + format_slot_options(slots)
                )
                state["booking_phase"] = "selecting_slot"
                state["source"] = "Booking System"
            else:
                state["generation"] = (
                    f"Please enter a valid number between 1 and {len(doctors)}."
                )
                state["source"] = "Booking System"
        except ValueError:
            state["generation"] = (
                "Please reply with the doctor's number (e.g., '1') to select, "
                "or type 'skip' to cancel."
            )
            state["source"] = "Booking System"

        _append_history(state)
        return state

    # ── Phase: SELECTING_SLOT — User picks a time slot by number ──────────
    if phase == "selecting_slot":
        if question in ("back", "cancel"):
            state["booking_phase"] = "recommending"
            state["generation"] = "Let me show you the doctors again..."
            state["source"] = "Booking System"
            # Re-trigger recommending
            return BookingAgent(state)

        # Build flat slot list from _available_slots
        slots_data = state.get("_available_slots", [])
        flat_slots = []
        for day in slots_data[:3]:
            for t in day["times"][:6]:
                flat_slots.append({"date": day["date"], "time": t, "display": f"{day['date_display']} at {t}"})

        try:
            choice = int(question.strip().replace(".", ""))
            if 1 <= choice <= len(flat_slots):
                selected_slot = flat_slots[choice - 1]
                doctor = state.get("selected_doctor", {})
                user_token = state.get("user_token")

                if not user_token:
                    state["generation"] = (
                        "⚠️ You need to be logged into the hospital system to book an appointment. "
                        "Please log in on the hospital website first, then return here."
                    )
                    state["booking_phase"] = "idle"
                    state["source"] = "Booking System"
                    _append_history(state)
                    return state

                # Book the appointment
                try:
                    result = book_appointment(
                        user_token, doctor["id"],
                        selected_slot["date"], selected_slot["time"]
                    )
                except Exception as e:
                    logger.error("BookingAgent: Booking call failed: %s", str(e))
                    result = {"success": False, "message": str(e)}

                if result.get("success"):
                    state["generation"] = (
                        f"✅ **Appointment Booked Successfully!**\n\n"
                        f"• **Doctor:** Dr. {doctor['name']}\n"
                        f"• **Speciality:** {doctor['speciality']}\n"
                        f"• **Date & Time:** {selected_slot['display']}\n"
                        f"• **Fee:** ₹{doctor['fees']}\n\n"
                        "You can view your appointment on the hospital website under 'My Appointments'. "
                        "Is there anything else I can help you with?"
                    )
                    state["source"] = "Appointment Confirmed"
                else:
                    state["generation"] = (
                        f"❌ Booking failed: {result.get('message', 'Unknown error')}. "
                        "Please try a different slot or try again later."
                    )
                    state["source"] = "Booking System"

                state["booking_phase"] = "idle"
                state["selected_doctor"] = None
                state["available_doctors"] = []
            else:
                state["generation"] = f"Please enter a valid slot number between 1 and {len(flat_slots)}."
                state["source"] = "Booking System"
        except ValueError:
            state["generation"] = (
                "Please reply with the slot number (e.g., '1') to book, "
                "or type 'back' to choose a different doctor."
            )
            state["source"] = "Booking System"

        _append_history(state)
        return state

    # ── Fallback — shouldn't reach here ───────────────────────────────────
    state["generation"] = "How can I help you?"
    state["source"] = "Booking System"
    _append_history(state)
    return state


def _append_history(state: AgentState):
    """Append the current Q&A pair to conversation history."""
    state["conversation_history"].append(
        {"role": "user", "content": state.get("question", "")}
    )
    state["conversation_history"].append(
        {"role": "assistant", "content": state.get("generation", ""), "source": state.get("source", "")}
    )
