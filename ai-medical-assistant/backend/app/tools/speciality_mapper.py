"""
VitCare AI — tools/speciality_mapper.py
Maps diagnosed symptoms/conditions to the exact speciality strings
stored in the hospital's MongoDB doctor collection.
"""

from app.core.logging_config import logger

# ── Speciality Mapping Rules ──────────────────────────────────────────────────
# Keys = exact speciality strings from MongoDB; Values = symptom/condition keywords
_SPECIALITY_KEYWORDS = {
    "Dermatologist": [
        "skin", "rash", "acne", "pimple", "eczema", "psoriasis", "dermatitis",
        "hives", "itching", "fungal", "ringworm", "moles", "warts", "sunburn",
        "hair loss", "alopecia", "vitiligo", "boil", "blister",
    ],
    "Neurologist": [
        "headache", "migraine", "seizure", "epilepsy", "numbness", "tingling",
        "paralysis", "stroke", "brain", "nerve", "memory loss", "alzheimer",
        "parkinson", "dizziness", "vertigo", "tremor", "sclerosis",
        "neuropathy", "concussion",
    ],
    "Gastroenterologist": [
        "stomach", "abdomen", "abdominal", "digestive", "diarrhea", "constipation",
        "nausea", "vomiting", "acid reflux", "heartburn", "ulcer", "gastritis",
        "bloating", "ibs", "crohn", "colitis", "liver", "hepatitis", "jaundice",
        "gallbladder", "intestine", "colon", "appendix",
    ],
    "Pediatricians": [
        "child", "infant", "baby", "toddler", "newborn", "pediatric",
        "childhood", "vaccination", "immunization", "growth", "teething",
        "colic", "diaper rash",
    ],
    "Gynecologist": [
        "pregnancy", "pregnant", "menstrual", "period", "ovary", "uterus",
        "pcos", "endometriosis", "fertility", "contraception", "menopause",
        "breast", "cervical", "prenatal", "postnatal", "gynec",
    ],
    "General physician": [
        "fever", "cold", "flu", "cough", "sore throat", "fatigue", "weakness",
        "body pain", "infection", "virus", "bacteria", "covid", "coronavirus",
        "blood pressure", "hypertension", "diabetes", "thyroid", "weight",
        "appetite", "dehydration", "allergy", "asthma", "breathing",
        "chest pain", "heart", "cholesterol", "anemia",
    ],
}

# These will be used if user adds more specialities to the hospital DB
_EXTENDED_SPECIALITY_KEYWORDS = {
    "Cardiologist": [
        "heart attack", "cardiac", "angina", "arrhythmia", "palpitation",
        "coronary", "cardiovascular", "ecg", "echocardiogram",
    ],
    "ENT Specialist": [
        "ear", "nose", "throat", "sinus", "sinusitis", "tonsil", "hearing",
        "tinnitus", "snoring", "sleep apnea", "voice", "laryngitis",
    ],
    "Orthopedic": [
        "bone", "fracture", "joint", "arthritis", "osteoporosis", "spine",
        "back pain", "knee", "shoulder", "hip", "ligament", "tendon",
        "sprain", "sports injury", "scoliosis",
    ],
    "Psychiatrist": [
        "depression", "anxiety", "bipolar", "schizophrenia", "insomnia",
        "sleep", "stress", "panic", "ptsd", "ocd", "adhd", "mental health",
        "mood", "suicidal", "addiction",
    ],
}


def map_symptoms_to_speciality(text: str, available_specialities: list = None) -> str:
    """
    Analyze text (diagnosis or symptoms) and return the best-matching
    speciality string from the hospital database.

    Args:
        text: The diagnosis text or user symptoms.
        available_specialities: Optional list of specialities actually in the DB.
            If provided, only matches against these. Otherwise uses all known mappings.

    Returns:
        A speciality string (e.g., "Dermatologist") or "General physician" as fallback.
    """
    text_lower = text.lower()

    # Merge base + extended mappings
    all_mappings = {**_SPECIALITY_KEYWORDS, **_EXTENDED_SPECIALITY_KEYWORDS}

    # If we know which specialities exist in the DB, filter to only those
    if available_specialities:
        all_mappings = {
            k: v for k, v in all_mappings.items() if k in available_specialities
        }

    # Score each speciality by keyword matches
    scores = {}
    for speciality, keywords in all_mappings.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[speciality] = score

    if scores:
        best = max(scores, key=scores.get)
        logger.info(
            "SpecialityMapper: '%s' → %s (score: %d)",
            text[:50], best, scores[best],
        )
        return best

    # Default fallback
    logger.info("SpecialityMapper: No strong match, defaulting to General physician")
    return "General physician"
