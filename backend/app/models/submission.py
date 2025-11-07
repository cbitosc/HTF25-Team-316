from datetime import datetime
from typing import Optional
from enum import Enum
from beanie import Document
from pydantic import Field


class SubmissionStatus(str, Enum):
    SUBMITTED = "submitted"
    GRADED = "graded"
    LATE = "late"
    RESUBMITTED = "resubmitted"


class Submission(Document):
    assignment_id: str = Field(..., index=True)
    student_id: str = Field(..., index=True)
    course_id: str = Field(..., index=True)
    
    # Submission details
    status: SubmissionStatus = Field(default=SubmissionStatus.SUBMITTED)
    content: Optional[str] = None
    attachment_urls: list[str] = Field(default_factory=list)
    
    # Grading
    score: Optional[float] = None
    max_score: float
    feedback: Optional[str] = None
    graded_by: Optional[str] = None  # Teacher ID
    
    # Dates
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    graded_at: Optional[datetime] = None
    resubmitted_at: Optional[datetime] = None
    
    # Status flags
    is_late: bool = Field(default=False)
    is_resubmission: bool = Field(default=False)
    attempt_number: int = Field(default=1)
    
    class Settings:
        name = "submissions"
        indexes = [
            "assignment_id",
            "student_id",
            "course_id",
            "status",
            ("assignment_id", "student_id"),  # Compound index
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "assignment_id": "ASSIGN001",
                "student_id": "STU001",
                "course_id": "COURSE001",
                "content": "My assignment solution...",
                "attachment_urls": ["https://storage.example.com/submissions/file.pdf"],
                "max_score": 100,
                "score": 85,
                "feedback": "Good work! Minor improvements needed."
            }
        }
