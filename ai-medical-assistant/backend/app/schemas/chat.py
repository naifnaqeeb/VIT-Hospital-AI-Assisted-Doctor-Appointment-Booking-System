"""
VitCare AI — schemas/chat.py
Pydantic schemas for chat request and response.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    user_token: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    source: str
    timestamp: str
    success: bool
    doctors: Optional[List[Dict[str, Any]]] = None
    slots: Optional[List[Dict[str, Any]]] = None

