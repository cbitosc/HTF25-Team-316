from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import Field


class Course(Document):
    code: str = Field(..., index=True, unique=True)
    name: str
    description: Optional[str] = None
    
    # Course details
    teacher_id: str = Field(..., index=True)
    teacher_name: str
    subject: str
    grade_level: Optional[str] = None
    
    # Enrollment
    enrolled_students: list[str] = Field(default_factory=list)  # Student IDs
    max_students: Optional[int] = None
    
    # Schedule
    schedule: Optional[str] = None  # e.g., "Mon, Wed, Fri 10:00-11:00"
    room: Optional[str] = None
    
    # Course metadata
    credits: Optional[int] = None
    syllabus_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    
    # Status
    is_active: bool = Field(default=True)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    
    # Dates
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "courses"
        indexes = [
            "code",
            "teacher_id",
            "subject",
            "is_active",
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "code": "CS101",
                "name": "Introduction to Computer Science",
                "description": "Basic concepts of computer science and programming",
                "teacher_id": "TEACHER001",
                "teacher_name": "Dr. Smith",
                "subject": "Computer Science",
                "grade_level": "10",
                "enrolled_students": ["STU001", "STU002"],
                "schedule": "Mon, Wed, Fri 10:00-11:00"
            }
        }
