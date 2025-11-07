from datetime import datetime
from typing import Optional
from enum import Enum
from beanie import Document
from pydantic import Field


class MaterialType(str, Enum):
    PDF = "pdf"
    VIDEO = "video"
    LINK = "link"
    PRESENTATION = "presentation"
    DOCUMENT = "document"
    OTHER = "other"


class Material(Document):
    title: str
    description: Optional[str] = None
    course_id: str = Field(..., index=True)
    teacher_id: str = Field(..., index=True)
    
    # Material details
    type: MaterialType
    file_url: Optional[str] = None
    external_link: Optional[str] = None
    content: Optional[str] = None  # For embedded content
    
    # Metadata
    file_size: Optional[int] = None  # in bytes
    duration: Optional[int] = None  # for videos, in seconds
    page_count: Optional[int] = None  # for PDFs
    
    # Organization
    tags: list[str] = Field(default_factory=list)
    category: Optional[str] = None
    
    # Access control
    is_public: bool = Field(default=False)
    accessible_to: list[str] = Field(default_factory=list)  # Student IDs
    
    # Dates
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = None
    
    # Analytics
    view_count: int = Field(default=0)
    download_count: int = Field(default=0)
    
    class Settings:
        name = "materials"
        indexes = [
            "course_id",
            "teacher_id",
            "type",
            "tags",
        ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Introduction to Python Programming",
                "description": "Comprehensive guide to Python basics",
                "course_id": "COURSE001",
                "teacher_id": "TEACHER001",
                "type": "pdf",
                "file_url": "https://storage.example.com/materials/intro-python.pdf",
                "tags": ["python", "programming", "basics"]
            }
        }
