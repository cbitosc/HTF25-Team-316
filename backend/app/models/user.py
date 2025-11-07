from datetime import datetime
from typing import Optional
from enum import Enum
from beanie import Document
from pydantic import EmailStr, Field


class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"


class User(Document):
    firebase_uid: str = Field(..., index=True, unique=True)
    email: EmailStr = Field(..., index=True, unique=True)
    display_name: str
    role: UserRole = Field(default=UserRole.STUDENT)
    profile_picture: Optional[str] = None
    phone_number: Optional[str] = None
    
    # Student-specific fields
    student_id: Optional[str] = None
    grade: Optional[str] = None
    enrolled_courses: list[str] = Field(default_factory=list)  # Course IDs
    
    # Teacher-specific fields
    teacher_id: Optional[str] = None
    department: Optional[str] = None
    teaching_courses: list[str] = Field(default_factory=list)  # Course IDs
    
    # Common fields
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    
    class Settings:
        name = "users"
        indexes = [
            "firebase_uid",
            "email",
            "role",
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "firebase_uid": "abc123xyz",
                "email": "student@example.com",
                "display_name": "John Doe",
                "role": "student",
                "student_id": "STU001",
                "grade": "10",
                "enrolled_courses": ["COURSE001", "COURSE002"]
            }
        }
