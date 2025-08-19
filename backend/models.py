from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

class User(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    created_at: datetime
    voice_profile: Optional[Dict[str, Any]] = None

class Content(BaseModel):
    id: str
    title: str
    content: str
    content_type: str
    spatial_position: Dict[str, float]
    workspace_id: Optional[str]
    author_id: str
    created_at: datetime
    updated_at: datetime
    status: str

class Workspace(BaseModel):
    id: str
    name: str
    description: str
    spatial_config: Dict[str, Any]
    owner_id: str
    members: List[str]
    created_at: datetime

class VoiceCommand(BaseModel):
    command: str
    confidence: float
    timestamp: datetime
    user_id: str

class SpatialPosition(BaseModel):
    x: float
    y: float
    z: float
    room_id: Optional[str] = None
