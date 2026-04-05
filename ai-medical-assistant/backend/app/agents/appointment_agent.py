"""
VitCare AI — agents/appointment_agent.py
AppointmentAgent: LangGraph node that manages viewing and canceling appointments.
"""

from app.core.logging_config import logger
from app.core.state import AgentState
from app.tools.booking_tool import fetch_user_appointments, cancel_user_appointment


def AppointmentAgent(state: AgentState) -> AgentState:
    """
    Agent responsible for listing and canceling appointments using the Express APIs.
    """
    phase = state.get("appointment_phase", "idle")
    question = state.get("question", "").strip().lower()
    user_token = state.get("user_token")

    logger.info("AppointmentAgent: phase=%s, input='%s'", phase, question[:50])

    if not user_token:
        state["generation"] = "⚠️ **Authentication Required**\n\nYou need to be logged into the hospital system to view or modify your appointments. Please log in first."
        state["appointment_phase"] = "idle"
        state["current_tool"] = None
        return state

    # ── Phase: VIEWING ──────────────────────────────────────────────────────────
    if phase == "viewing":
        resp = fetch_user_appointments(user_token)
        if not resp.get("success"):
            state["generation"] = f"Sorry, I couldn't fetch your appointments at this time. ({resp.get('message')})"
        else:
            appointments = resp.get("appointments", [])
            active_appointments = [a for a in appointments if not a.get("cancelled")]

            if not active_appointments:
                state["generation"] = "You currently have no upcoming appointments."
            else:
                lines = ["### Your Upcoming Appointments\n"]
                for i, apt in enumerate(active_appointments, 1):
                    doc = apt.get("docData", {})
                    name = doc.get("name", "Unknown Doctor")
                    speciality = doc.get("speciality", "Specialist")
                    date = apt.get("slotDate", "Unknown Date").replace("_", " ")
                    time = apt.get("slotTime", "Unknown Time")
                    
                    if not name.startswith("Dr."):
                        name = f"Dr. {name}"
                    
                    lines.append(f"**{i}. {name}** ({speciality}) — {date} at {time}")
                
                state["generation"] = "\n\n".join(lines)
        
        # Reset state back to normal conversation
        state["appointment_phase"] = "idle"
        state["current_tool"] = None
        return state


    # ── Phase: CANCELING (Show list and ask for number) ───────────────────────
    if phase == "canceling":
        resp = fetch_user_appointments(user_token)
        if not resp.get("success"):
            state["generation"] = "Sorry, I couldn't fetch your appointments to cancel them."
            state["appointment_phase"] = "idle"
            state["current_tool"] = None
            return state

        appointments = resp.get("appointments", [])
        active_appointments = [a for a in appointments if not a.get("cancelled")]

        if not active_appointments:
            state["generation"] = "You don't have any active appointments to cancel."
            state["appointment_phase"] = "idle"
            state["current_tool"] = None
            return state

        # If they already specified a number in their question, we could parse it,
        # but for safety, let's always show the list and ask strictly for confirmation.
        state["_cancellable_appointments"] = active_appointments
        
        lines = ["### Cancel an Appointment\n", "Please reply with the **number** of the appointment you wish to cancel (or type 'back' to exit):\n"]
        for i, apt in enumerate(active_appointments, 1):
            doc = apt.get("docData", {})
            name = doc.get("name", "Doctor")
            date = apt.get("slotDate", "Date").replace("_", " ")
            time = apt.get("slotTime", "Time")
            
            if not name.startswith("Dr."):
                name = f"Dr. {name}"
                
            lines.append(f"**{i}.** {name} — {date} at {time}")
            
        state["generation"] = "\n\n".join(lines)
        state["appointment_phase"] = "confirm_canceling"
        return state


    # ── Phase: CONFIRM_CANCELING (Extract number and execute) ─────────────────
    if phase == "confirm_canceling":
        if question in ("back", "exit", "cancel", "no", "nevermind"):
            state["generation"] = "Okay, appointment cancellation aborted."
            state["appointment_phase"] = "idle"
            state["current_tool"] = None
            return state

        # Re-fetch active appointments dynamically instead of relying on State payload caching
        resp = fetch_user_appointments(user_token)
        appointments = resp.get("appointments", []) if resp.get("success") else []
        active_appointments = [a for a in appointments if not a.get("cancelled")]
        
        import re
        match = re.search(r'\d+', question)
        if not match:
            state["generation"] = "I didn't catch a valid number. Please reply with the number of the appointment you want to cancel, or type 'back'."
            return state
            
        index = int(match.group()) - 1
        
        if index < 0 or index >= len(active_appointments):
            state["generation"] = f"Invalid selection. Please choose a number between 1 and {len(active_appointments)}."
            return state
            
        target_apt = active_appointments[index]
        apt_id = str(target_apt.get("_id", target_apt.get("id")))

        # Call the cancel tool
        resp = cancel_user_appointment(user_token, apt_id)
        
        if resp.get("success"):
            doc_name = target_apt.get("docData", {}).get("name", "Doctor")
            if not doc_name.startswith("Dr."):
                doc_name = f"Dr. {doc_name}"
            state["generation"] = f"✅ Successfully cancelled your appointment with {doc_name}."
        else:
            state["generation"] = f"❌ Failed to cancel the appointment: {resp.get('message')}"

        state["appointment_phase"] = "idle"
        state["current_tool"] = None
        return state

    # Fallback
    state["generation"] = "I hit an invalid state while managing appointments."
    state["appointment_phase"] = "idle"
    state["current_tool"] = None
    return state
