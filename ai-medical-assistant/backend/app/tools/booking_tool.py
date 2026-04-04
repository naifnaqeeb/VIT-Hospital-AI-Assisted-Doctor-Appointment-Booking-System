"""
VitCare AI — tools/booking_tool.py
HTTP client tool to book appointments via the hospital backend API.
Uses the patient's JWT token for authentication.
"""

from datetime import datetime, timedelta

import httpx

from app.core.logging_config import logger

HOSPITAL_API_BASE = "http://localhost:4000/api"


def book_appointment(user_token: str, doc_id: str, slot_date: str, slot_time: str) -> dict:
    """
    Book an appointment by calling the hospital backend API.

    Args:
        user_token: JWT token of the logged-in patient.
        doc_id: MongoDB _id of the selected doctor.
        slot_date: Date string in format "DD_MM_YYYY".
        slot_time: Time string like "10:00 am".

    Returns:
        dict with 'success' (bool) and 'message' (str).
    """
    try:
        import httpx
        headers = {"token": user_token}
        payload = {
            "docId": doc_id,
            "slotDate": slot_date,
            "slotTime": slot_time,
        }

        with httpx.Client(timeout=10.0) as client:
            resp = client.post(
                f"{HOSPITAL_API_BASE}/user/book-appointment",
                json=payload,
                headers=headers,
            )
            resp.raise_for_status()
            data = resp.json()

        if data.get("success"):
            logger.info("BookingTool: Appointment booked — doc=%s, date=%s, time=%s", doc_id[:8], slot_date, slot_time)
        else:
            logger.warning("BookingTool: Booking failed — %s", data.get("message", "Unknown error"))

        return data

    except httpx.ConnectError:
        logger.error("BookingTool: Cannot connect to hospital backend")
        return {"success": False, "message": "Hospital server is not reachable. Please try again later."}
    except Exception as e:
        logger.error("BookingTool: Error booking appointment: %s", str(e))
        return {"success": False, "message": f"Booking failed: {str(e)}"}


def generate_available_slots(doctor: dict) -> list:
    """
    Generate a list of available time slots for the next 7 days.
    Excludes slots that are already booked (from doctor['slots_booked']).

    Returns:
        List of dicts: [{"date": "05_04_2026", "date_display": "Sat, Apr 05", "times": ["10:00 am", ...]}]
    """
    all_times = [
        "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
        "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
        "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
    ]

    slots_booked = doctor.get("slots_booked", {})
    available_days = []

    for day_offset in range(0, 7):  # Next 7 days including today
        date = datetime.now() + timedelta(days=day_offset)
        date_key = f"{date.day}_{date.month}_{date.year}"
        date_display = date.strftime("%a, %b %d")

        import re
        booked_raw = slots_booked.get(date_key, [])
        booked_normalized = [re.sub(r'[^a-zA-Z0-9]', '', str(t)).lower() for t in booked_raw]
        
        free_times = [t for t in all_times if re.sub(r'[^a-zA-Z0-9]', '', t).lower() not in booked_normalized]

        if free_times:
            available_days.append({
                "date": date_key,
                "date_display": date_display,
                "times": free_times,
            })

    return available_days


def format_slot_options(slots: list) -> str:
    """Format available slots into a readable message for the patient."""
    if not slots:
        return "Sorry, this doctor has no available slots in the next 7 days. Please try another doctor."

    return "Please click on a time slot below to book, or type 'back' to choose a different doctor."
