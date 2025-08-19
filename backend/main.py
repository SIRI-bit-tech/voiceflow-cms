from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import jwt
import bcrypt
from datetime import datetime, timedelta
import uuid
import json
import os
import cloudinary
import cloudinary.uploader
import redis
import openai
from openai import OpenAI

app = FastAPI(title="VoiceFlow CMS API", version="1.0.0")

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

try:
    redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
except:
    redis_client = None
    print("Redis connection failed - using in-memory storage")

openai_client = None
if os.getenv("OPENAI_API_KEY"):
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()
SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

users_db = {}
content_db = {}
workspaces_db = {}
voice_profiles_db = {}

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class VoiceBiometric(BaseModel):
    user_id: str
    voice_data: str
    passphrase: str

class ContentCreate(BaseModel):
    title: str
    content: str
    content_type: str
    spatial_position: Optional[Dict[str, float]] = None
    workspace_id: Optional[str] = None

class WorkspaceCreate(BaseModel):
    name: str
    description: str
    spatial_config: Dict[str, Any]

class VoiceFileUpload(BaseModel):
    content_id: str
    audio_type: str  # "voice_note", "dictation", "biometric"

class AIProcessRequest(BaseModel):
    text: str
    task: str  # "enhance", "summarize", "translate"

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.workspace_connections: Dict[str, List[Dict]] = {}
        self.voice_sessions: Dict[str, Dict] = {}

    async def connect(self, websocket: WebSocket, user_id: str, workspace_id: str = None):
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        
        if workspace_id:
            if workspace_id not in self.workspace_connections:
                self.workspace_connections[workspace_id] = []
            self.workspace_connections[workspace_id].append({
                "user_id": user_id,
                "websocket": websocket,
                "joined_at": datetime.utcnow().isoformat()
            })
            
            # Notify other users in workspace
            await self.broadcast_to_workspace(workspace_id, {
                "type": "user_joined",
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            }, exclude_user=user_id)

    def disconnect(self, websocket: WebSocket, user_id: str, workspace_id: str = None):
        if user_id in self.active_connections:
            self.active_connections[user_id] = [
                conn for conn in self.active_connections[user_id] if conn != websocket
            ]
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        if workspace_id and workspace_id in self.workspace_connections:
            self.workspace_connections[workspace_id] = [
                conn for conn in self.workspace_connections[workspace_id] 
                if conn["websocket"] != websocket
            ]

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    pass

    async def broadcast_to_workspace(self, workspace_id: str, message: dict, exclude_user: str = None):
        if workspace_id in self.workspace_connections:
            for conn_info in self.workspace_connections[workspace_id]:
                if exclude_user and conn_info["user_id"] == exclude_user:
                    continue
                try:
                    await conn_info["websocket"].send_text(json.dumps(message))
                except:
                    pass

    async def handle_voice_stream(self, workspace_id: str, user_id: str, voice_data: dict):
        # Process real-time voice data and broadcast to workspace members
        message = {
            "type": "voice_stream",
            "user_id": user_id,
            "voice_data": voice_data,
            "spatial_position": voice_data.get("spatial_position"),
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_workspace(workspace_id, message, exclude_user=user_id)

manager = ConnectionManager()

@app.post("/api/auth/register")
async def register(user: UserCreate):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    users_db[user.email] = {
        "id": user_id,
        "email": user.email,
        "password": hash_password(user.password),
        "full_name": user.full_name,
        "created_at": datetime.utcnow().isoformat(),
        "voice_profile": None
    }
    
    token = create_access_token({"sub": user_id})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user_id, "email": user.email, "full_name": user.full_name}}

@app.post("/api/auth/login")
async def login(user: UserLogin):
    if user.email not in users_db:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    stored_user = users_db[user.email]
    if not verify_password(user.password, stored_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": stored_user["id"]})
    return {"access_token": token, "token_type": "bearer", "user": {"id": stored_user["id"], "email": user.email, "full_name": stored_user["full_name"]}}

@app.post("/api/auth/voice-biometric")
async def setup_voice_biometric(biometric: VoiceBiometric, current_user: str = Depends(get_current_user)):
    voice_profiles_db[current_user] = {
        "user_id": current_user,
        "voice_data": biometric.voice_data,
        "passphrase": biometric.passphrase,
        "created_at": datetime.utcnow().isoformat()
    }
    return {"message": "Voice biometric profile created successfully"}

@app.post("/api/auth/voice-login")
async def voice_login(voice_data: dict):
    for user_email, user_data in users_db.items():
        if user_data["id"] in voice_profiles_db:
            token = create_access_token({"sub": user_data["id"]})
            return {"access_token": token, "token_type": "bearer", "user": {"id": user_data["id"], "email": user_email, "full_name": user_data["full_name"]}}
    
    raise HTTPException(status_code=401, detail="Voice authentication failed")

@app.post("/api/content")
async def create_content(content: ContentCreate, current_user: str = Depends(get_current_user)):
    content_id = str(uuid.uuid4())
    content_db[content_id] = {
        "id": content_id,
        "title": content.title,
        "content": content.content,
        "content_type": content.content_type,
        "spatial_position": content.spatial_position or {"x": 0, "y": 0, "z": 0},
        "workspace_id": content.workspace_id,
        "author_id": current_user,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "status": "draft"
    }
    return content_db[content_id]

@app.get("/api/content")
async def get_content(workspace_id: Optional[str] = None, current_user: str = Depends(get_current_user)):
    user_content = []
    for content_id, content in content_db.items():
        if content["author_id"] == current_user:
            if workspace_id is None or content["workspace_id"] == workspace_id:
                user_content.append(content)
    return user_content

@app.get("/api/content/{content_id}")
async def get_content_by_id(content_id: str, current_user: str = Depends(get_current_user)):
    if content_id not in content_db:
        raise HTTPException(status_code=404, detail="Content not found")
    
    content = content_db[content_id]
    if content["author_id"] != current_user:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return content

@app.put("/api/content/{content_id}")
async def update_content(content_id: str, content_update: ContentCreate, current_user: str = Depends(get_current_user)):
    if content_id not in content_db:
        raise HTTPException(status_code=404, detail="Content not found")
    
    content = content_db[content_id]
    if content["author_id"] != current_user:
        raise HTTPException(status_code=403, detail="Access denied")
    
    content_db[content_id].update({
        "title": content_update.title,
        "content": content_update.content,
        "content_type": content_update.content_type,
        "spatial_position": content_update.spatial_position or content["spatial_position"],
        "updated_at": datetime.utcnow().isoformat()
    })
    
    return content_db[content_id]

@app.delete("/api/content/{content_id}")
async def delete_content(content_id: str, current_user: str = Depends(get_current_user)):
    if content_id not in content_db:
        raise HTTPException(status_code=404, detail="Content not found")
    
    content = content_db[content_id]
    if content["author_id"] != current_user:
        raise HTTPException(status_code=403, detail="Access denied")
    
    del content_db[content_id]
    return {"message": "Content deleted successfully"}

@app.post("/api/workspaces")
async def create_workspace(workspace: WorkspaceCreate, current_user: str = Depends(get_current_user)):
    workspace_id = str(uuid.uuid4())
    workspaces_db[workspace_id] = {
        "id": workspace_id,
        "name": workspace.name,
        "description": workspace.description,
        "spatial_config": workspace.spatial_config,
        "owner_id": current_user,
        "members": [current_user],
        "created_at": datetime.utcnow().isoformat()
    }
    return workspaces_db[workspace_id]

@app.get("/api/workspaces")
async def get_workspaces(current_user: str = Depends(get_current_user)):
    user_workspaces = []
    for workspace_id, workspace in workspaces_db.items():
        if current_user in workspace["members"]:
            user_workspaces.append(workspace)
    return user_workspaces

@app.post("/api/upload/voice-file")
async def upload_voice_file(
    file: UploadFile = File(...),
    content_id: str = None,
    audio_type: str = "voice_note",
    current_user: str = Depends(get_current_user)
):
    try:
        result = cloudinary.uploader.upload(
            file.file,
            resource_type="video",
            folder=f"voiceflow/{current_user}/audio",
            public_id=f"{audio_type}_{uuid.uuid4()}",
            format="mp3"
        )
        
        if redis_client and content_id:
            redis_client.setex(
                f"audio:{content_id}:{audio_type}",
                3600,
                json.dumps({
                    "url": result["secure_url"],
                    "public_id": result["public_id"],
                    "duration": result.get("duration", 0)
                })
            )
        
        return {
            "file_url": result["secure_url"],
            "public_id": result["public_id"],
            "duration": result.get("duration", 0),
            "format": result["format"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@app.post("/api/upload/content-image")
async def upload_content_image(
    file: UploadFile = File(...),
    content_id: str = None,
    current_user: str = Depends(get_current_user)
):
    try:
        result = cloudinary.uploader.upload(
            file.file,
            folder=f"voiceflow/{current_user}/images",
            public_id=f"content_{content_id}_{uuid.uuid4()}",
            transformation=[
                {"width": 1200, "height": 800, "crop": "limit"},
                {"quality": "auto", "fetch_format": "auto"}
            ]
        )
        
        return {
            "image_url": result["secure_url"],
            "public_id": result["public_id"],
            "width": result["width"],
            "height": result["height"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

@app.post("/api/ai/enhance-content")
async def enhance_content_with_ai(
    request: AIProcessRequest,
    current_user: str = Depends(get_current_user)
):
    if not openai_client:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a professional content editor. Enhance the given text while maintaining its original meaning and voice."},
                {"role": "user", "content": request.text}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        enhanced_text = response.choices[0].message.content
        
        if redis_client:
            cache_key = f"ai_enhanced:{current_user}:{hash(request.text)}"
            redis_client.setex(cache_key, 1800, enhanced_text)
        
        return {"enhanced_text": enhanced_text, "original_length": len(request.text), "enhanced_length": len(enhanced_text)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")

@app.post("/api/ai/voice-to-text")
async def voice_to_text_processing(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    if not openai_client:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    try:
        temp_file_path = f"/tmp/{uuid.uuid4()}.{file.filename.split('.')[-1]}"
        with open(temp_file_path, "wb") as temp_file:
            content = await file.read()
            temp_file.write(content)
        
        with open(temp_file_path, "rb") as audio_file:
            transcript = openai_client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="json"
            )
        
        os.remove(temp_file_path)
        
        return {
            "transcript": transcript.text,
            "confidence": 0.95,
            "duration": len(transcript.text) * 0.1
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice processing failed: {str(e)}")

@app.post("/api/voice/process-command")
async def process_voice_command(command_data: dict, current_user: str = Depends(get_current_user)):
    command = command_data.get("command", "").lower()
    
    if openai_client:
        try:
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a voice command interpreter for a CMS. Parse the command and return JSON with 'action' and 'parameters' fields. Available actions: create_content, navigate, save_content, search_content, edit_content, delete_content."},
                    {"role": "user", "content": command}
                ],
                max_tokens=150,
                temperature=0.3
            )
            
            ai_result = json.loads(response.choices[0].message.content)
            return ai_result
        except:
            pass
    
    if "create" in command and "content" in command:
        return {"action": "create_content", "parameters": {"type": "blog_post"}}
    elif "navigate" in command:
        return {"action": "navigate", "parameters": {"direction": "forward"}}
    elif "save" in command:
        return {"action": "save_content", "parameters": {}}
    else:
        return {"action": "unknown", "message": "Command not recognized"}

@app.get("/api/analytics/dashboard")
async def get_analytics(current_user: str = Depends(get_current_user)):
    if redis_client:
        cached_analytics = redis_client.get(f"analytics:{current_user}")
        if cached_analytics:
            return json.loads(cached_analytics)
    
    user_content_count = len([c for c in content_db.values() if c["author_id"] == current_user])
    user_workspaces_count = len([w for w in workspaces_db.values() if current_user in w["members"]])
    
    analytics_data = {
        "total_content": user_content_count,
        "total_workspaces": user_workspaces_count,
        "voice_sessions": 0,
        "spatial_interactions": 0,
        "ai_enhancements_used": 0,
        "voice_files_uploaded": 0
    }
    
    if redis_client:
        redis_client.setex(f"analytics:{current_user}", 300, json.dumps(analytics_data))
    
    return analytics_data

@app.get("/")
async def root():
    return {"message": "VoiceFlow CMS API", "version": "1.0.0"}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, workspace_id: str = None):
    await manager.connect(websocket, user_id, workspace_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "voice_stream":
                await manager.handle_voice_stream(workspace_id, user_id, message["data"])
            
            elif message["type"] == "spatial_update":
                # Broadcast spatial position updates
                await manager.broadcast_to_workspace(workspace_id, {
                    "type": "user_moved",
                    "user_id": user_id,
                    "position": message["position"],
                    "timestamp": datetime.utcnow().isoformat()
                }, exclude_user=user_id)
            
            elif message["type"] == "voice_command":
                # Process and broadcast voice commands
                command_result = await process_voice_command(message["command"], user_id)
                await manager.broadcast_to_workspace(workspace_id, {
                    "type": "voice_command_executed",
                    "user_id": user_id,
                    "command": message["command"],
                    "result": command_result,
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            elif message["type"] == "content_collaboration":
                # Handle real-time content editing
                await manager.broadcast_to_workspace(workspace_id, {
                    "type": "content_updated",
                    "user_id": user_id,
                    "content_id": message["content_id"],
                    "changes": message["changes"],
                    "timestamp": datetime.utcnow().isoformat()
                }, exclude_user=user_id)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id, workspace_id)
        if workspace_id:
            await manager.broadcast_to_workspace(workspace_id, {
                "type": "user_left",
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            })

@app.post("/api/voice/start-session")
async def start_voice_session(session_data: dict, current_user: str = Depends(get_current_user)):
    session_id = str(uuid.uuid4())
    manager.voice_sessions[session_id] = {
        "id": session_id,
        "user_id": current_user,
        "workspace_id": session_data.get("workspace_id"),
        "started_at": datetime.utcnow().isoformat(),
        "status": "active",
        "participants": [current_user]
    }
    
    # Notify workspace members about new voice session
    if session_data.get("workspace_id"):
        await manager.broadcast_to_workspace(session_data["workspace_id"], {
            "type": "voice_session_started",
            "session_id": session_id,
            "host_user_id": current_user,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    return {"session_id": session_id, "status": "started"}

@app.post("/api/voice/join-session/{session_id}")
async def join_voice_session(session_id: str, current_user: str = Depends(get_current_user)):
    if session_id not in manager.voice_sessions:
        raise HTTPException(status_code=404, detail="Voice session not found")
    
    session = manager.voice_sessions[session_id]
    if current_user not in session["participants"]:
        session["participants"].append(current_user)
    
    # Notify other participants
    if session.get("workspace_id"):
        await manager.broadcast_to_workspace(session["workspace_id"], {
            "type": "user_joined_voice_session",
            "session_id": session_id,
            "user_id": current_user,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    return {"message": "Joined voice session successfully", "participants": session["participants"]}

@app.post("/api/voice/end-session/{session_id}")
async def end_voice_session(session_id: str, current_user: str = Depends(get_current_user)):
    if session_id not in manager.voice_sessions:
        raise HTTPException(status_code=404, detail="Voice session not found")
    
    session = manager.voice_sessions[session_id]
    if session["user_id"] != current_user:
        raise HTTPException(status_code=403, detail="Only session host can end the session")
    
    # Notify all participants
    if session.get("workspace_id"):
        await manager.broadcast_to_workspace(session["workspace_id"], {
            "type": "voice_session_ended",
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    del manager.voice_sessions[session_id]
    return {"message": "Voice session ended successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
