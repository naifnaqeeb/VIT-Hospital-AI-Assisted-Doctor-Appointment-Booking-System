"""
VitCare AI — tools/doctor_tool.py
HTTP client tool to fetch doctors from the hospital backend API
and filter by speciality and availability.
"""

import httpx

from app.core.logging_config import logger

# The hospital backend base URL (Node.js server on port 4000)
HOSPITAL_API_BASE = "http://localhost:4000/api"


def fetch_available_doctors(speciality: str) -> list:
    """
    Fetch all available doctors for a given speciality from the hospital DB.

    Calls GET /api/doctor/list and filters by speciality + available=True.

    Returns:
        List of doctor dicts
    """
    try:
        import httpx
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{HOSPITAL_API_BASE}/doctor/list")
            resp.raise_for_status()
            data = resp.json()

        if not data.get("success"):
            logger.error("DoctorTool: Hospital API returned failure")
            return []

        all_doctors = data.get("doctors", [])

        # Filter by speciality (case-insensitive) and availability
        matched = [
            {
                "id": str(doc.get("_id", "")),
                "name": doc.get("name", "Unknown"),
                "speciality": doc.get("speciality", ""),
                "degree": doc.get("degree", ""),
                "experience": doc.get("experience", ""),
                "fees": doc.get("fees", 0),
                "available": doc.get("available", False),
                "image": doc.get("image", ""),
                "slots_booked": doc.get("slots_booked", {}),
            }
            for doc in all_doctors
            if doc.get("speciality", "").lower() == speciality.lower()
            and doc.get("available", False)
        ]

        logger.info(
            "DoctorTool: Found %d available %s(s)", len(matched), speciality
        )
        return matched

    except httpx.ConnectError:
        logger.error("DoctorTool: Cannot connect to hospital backend at %s", HOSPITAL_API_BASE)
        return []
    except Exception as e:
        logger.error("DoctorTool: Error fetching doctors: %s", str(e))
        return []

def fetch_all_specialities() -> list:
    """
    Fetch unique speciality strings from all doctors in the hospital DB.
    """
    try:
        import httpx
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{HOSPITAL_API_BASE}/doctor/list")
            resp.raise_for_status()
            data = resp.json()

        if not data.get("success"):
            return []

        specialities = list(set(
            doc.get("speciality", "")
            for doc in data.get("doctors", [])
            if doc.get("speciality")
        ))
        logger.info("DoctorTool: Found specialities in DB: %s", specialities)
        return specialities

    except Exception as e:
        logger.error("DoctorTool: Error fetching specialities: %s", str(e))
        return []


def format_doctor_list(doctors: list) -> str:
    """
    Format a list of doctor dicts into a human-readable string
    the LLM can present conversationally.
    """
    if not doctors:
        return "No available doctors found for this speciality at the moment."

    lines = ["Here are the available doctors:\n"]
    for i, doc in enumerate(doctors, 1):
        lines.append(
            f"**{i}. {doc['name']}**\n"
            f"   • Degree: {doc['degree']}\n"
            f"   • Experience: {doc['experience']}\n"
            f"   • Consultation Fee: ₹{doc['fees']}\n"
        )

    lines.append(
        "\nPlease reply with the **doctor's number** (e.g., '1') to select a doctor, "
        "or type 'skip' if you'd like to book later."
    )
    return "\n".join(lines)
