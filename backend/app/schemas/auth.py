from datetime import datetime
from typing import Optional, TYPE_CHECKING
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole

if TYPE_CHECKING:
    pass


# Authentication schemas
class UserRegister(BaseModel):
    email: EmailStr
    # Password is optional because Google sign-in flow won't supply it
    password: Optional[str] = None  # Not used by backend; Firebase handles auth
    display_name: str
    role: UserRole = UserRole.STUDENT
    # Frontend must provide the Firebase ID token obtained after successful auth
    firebase_token: str  # Firebase ID token from frontend
    
    # Optional student fields
    student_id: Optional[str] = None
    grade: Optional[str] = None
    
    # Optional teacher fields
    teacher_id: Optional[str] = None
    department: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class FirebaseLoginRequest(BaseModel):
    firebase_token: str


# User response schemas
class UserResponse(BaseModel):
    id: str
    firebase_uid: str
    email: EmailStr
    display_name: str
    role: UserRole
    profile_picture: Optional[str] = None
    phone_number: Optional[str] = None
    
    # Student fields
    student_id: Optional[str] = None
    grade: Optional[str] = None
    enrolled_courses: list[str] = []
    
    # Teacher fields
    teacher_id: Optional[str] = None
    department: Optional[str] = None
    teaching_courses: list[str] = []
    
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    profile_picture: Optional[str] = None
    phone_number: Optional[str] = None
    grade: Optional[str] = None
    department: Optional[str] = None


# Message schemas
class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    status_code: int
