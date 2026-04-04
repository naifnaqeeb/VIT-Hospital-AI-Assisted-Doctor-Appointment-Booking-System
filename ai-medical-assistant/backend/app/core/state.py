"""
VitCare AI — core/state.py
AgentState TypedDict and state helper functions.
"""

from typing import Any, Dict, List, Optional, TypedDict

from langchain_core.documents import Document


class AgentState(TypedDict):
    """Shared state passed between all LangGraph agent nodes."""

    question: str
    documents: List[Document]
    generation: str
    source: str
    search_query: Optional[str]
    conversation_history: List[Dict]
    llm_attempted: bool
    llm_success: bool
    rag_attempted: bool
    rag_success: bool
    wiki_attempted: bool
    wiki_success: bool
    tavily_attempted: bool
    tavily_success: bool
    current_tool: Optional[str]
    retry_count: int

    # ── Booking Flow Fields ────────────────────────────────────────────────────
    booking_phase: str  # "idle" | "recommending" | "selecting_doctor" | "selecting_slot" | "confirming"
    diagnosed_speciality: Optional[str]
    available_doctors: List[Dict[str, Any]]
    selected_doctor: Optional[Dict[str, Any]]
    user_token: Optional[str]
    _available_slots: Optional[List[Dict[str, Any]]]

    # ── Diagnostic Conversation Tracking ──────────────────────────────────────
    symptom_turn_count: int   # how many symptom messages exchanged so far
    booking_suggested: bool   # True once specialist suggestion has been made


def initialize_conversation_state() -> AgentState:
    """Return a fresh AgentState with all fields at their defaults."""
    return {
        "question": "",
        "documents": [],
        "generation": "",
        "source": "",
        "search_query": None,
        "conversation_history": [],
        "llm_attempted": False,
        "llm_success": False,
        "rag_attempted": False,
        "rag_success": False,
        "wiki_attempted": False,
        "wiki_success": False,
        "tavily_attempted": False,
        "tavily_success": False,
        "current_tool": None,
        "retry_count": 0,
        # Booking defaults
        "booking_phase": "idle",
        "diagnosed_speciality": None,
        "available_doctors": [],
        "selected_doctor": None,
        "user_token": None,
        "_available_slots": None,
        # Diagnostic tracking
        "symptom_turn_count": 0,
        "booking_suggested": False,
    }


def reset_query_state(state: AgentState) -> AgentState:
    """Reset per-query flags while preserving conversation history and booking state."""
    state.update(
        {
            "question": "",
            "documents": [],
            "generation": "",
            "source": "",
            "search_query": None,
            "llm_attempted": False,
            "llm_success": False,
            "rag_attempted": False,
            "rag_success": False,
            "wiki_attempted": False,
            "wiki_success": False,
            "tavily_attempted": False,
            "tavily_success": False,
            "current_tool": None,
            "retry_count": 0,
            # NOTE: booking_phase, diagnosed_speciality, available_doctors,
            # selected_doctor, user_token, symptom_turn_count, and booking_suggested
            # are intentionally NOT reset so the booking + diagnostic flows
            # can persist across multiple messages.
        }
    )
    return state
