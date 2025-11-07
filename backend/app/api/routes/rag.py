"""
RAG API Routes
Endpoints for vectorizing study materials and querying them
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
from pydantic import BaseModel
import shutil
from pathlib import Path
import uuid

from app.services.rag_service import get_rag_service, RAGService
from app.api.dependencies import get_current_user
from app.models.user import User


router = APIRouter(prefix="/rag", tags=["RAG"])


# Request/Response Models
class VectorizeRequest(BaseModel):
    material_id: str
    file_path: str
    title: Optional[str] = None
    course_id: Optional[str] = None


class QueryRequest(BaseModel):
    material_id: str
    query: str
    num_results: int = 5
    temperature: float = 0.3  # Creativity level: 0.0 (precise) to 1.0 (creative)


class MultiQueryRequest(BaseModel):
    material_ids: List[str]
    query: str
    num_results: int = 3
    temperature: float = 0.3  # Creativity level: 0.0 (precise) to 1.0 (creative)


class VectorizeResponse(BaseModel):
    success: bool
    material_id: str
    num_chunks: int
    total_characters: int
    message: str


class QueryResponse(BaseModel):
    success: bool
    answer: str
    sources: List[dict]
    material_id: Optional[str] = None
    error: Optional[str] = None


# Endpoints
@router.post("/vectorize", response_model=VectorizeResponse)
async def vectorize_material(
    request: VectorizeRequest,
    current_user: User = Depends(get_current_user),
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Vectorize a study material for RAG
    Only teachers can vectorize materials
    """
    # Check if user is a teacher
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=403,
            detail="Only teachers can vectorize study materials"
        )
    
    try:
        # Prepare metadata
        metadata = {
            "title": request.title,
            "course_id": request.course_id,
            "uploaded_by": str(current_user.id)
        }
        
        # Vectorize the material
        result = await rag_service.vectorize_material(
            material_id=request.material_id,
            file_path=request.file_path,
            metadata=metadata
        )
        
        return VectorizeResponse(
            success=result["success"],
            material_id=result["material_id"],
            num_chunks=result["num_chunks"],
            total_characters=result["total_characters"],
            message=f"Successfully vectorized {request.material_id}"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-and-vectorize")
async def upload_and_vectorize(
    file: UploadFile = File(...),
    material_id: str = Form(...),
    title: Optional[str] = Form(None),
    course_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Upload a PDF file and vectorize it in one step
    Only teachers can upload and vectorize materials
    """
    # Check if user is a teacher
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=403,
            detail="Only teachers can upload and vectorize study materials"
        )
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )
    
    try:
        # Create uploads directory if it doesn't exist
        uploads_dir = Path("./data/uploads")
        uploads_dir.mkdir(parents=True, exist_ok=True)
        
        # Save uploaded file
        file_path = uploads_dir / f"{material_id}_{file.filename}"
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Prepare metadata
        metadata = {
            "title": title or file.filename,
            "course_id": course_id,
            "uploaded_by": str(current_user.id),
            "filename": file.filename
        }
        
        # Vectorize the material
        result = await rag_service.vectorize_material(
            material_id=material_id,
            file_path=str(file_path),
            metadata=metadata
        )
        
        return {
            "success": True,
            "material_id": result["material_id"],
            "num_chunks": result["num_chunks"],
            "total_characters": result["total_characters"],
            "file_path": str(file_path),
            "message": "File uploaded and vectorized successfully"
        }
        
    except Exception as e:
        # Clean up file if vectorization fails
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query", response_model=QueryResponse)
async def query_material(
    request: QueryRequest,
    current_user: User = Depends(get_current_user),
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Query a specific study material using RAG
    Students and teachers can query materials
    """
    try:
        result = await rag_service.query_material(
            material_id=request.material_id,
            query=request.query,
            num_results=request.num_results,
            temperature=request.temperature
        )
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result.get("error"))
        
        return QueryResponse(
            success=True,
            answer=result["answer"],
            sources=result["sources"],
            material_id=result["material_id"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query-multiple", response_model=QueryResponse)
async def query_multiple_materials(
    request: MultiQueryRequest,
    current_user: User = Depends(get_current_user),
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Query multiple study materials at once using RAG
    Students and teachers can query materials
    """
    try:
        result = await rag_service.query_multiple_materials(
            material_ids=request.material_ids,
            query=request.query,
            num_results=request.num_results,
            temperature=request.temperature
        )
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result.get("error"))
        
        return QueryResponse(
            success=True,
            answer=result["answer"],
            sources=result["sources"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/material/{material_id}")
async def delete_material_vectors(
    material_id: str,
    current_user: User = Depends(get_current_user),
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Delete vector embeddings for a material
    Only teachers can delete material vectors
    """
    # Check if user is a teacher
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=403,
            detail="Only teachers can delete material vectors"
        )
    
    try:
        success = await rag_service.delete_material_vectors(material_id)
        
        if success:
            return {"success": True, "message": "Material vectors deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Material not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def rag_health_check():
    """Check if RAG service is running"""
    try:
        rag_service = get_rag_service()
        return {
            "status": "healthy",
            "model": rag_service.model_name,
            "embedding_model": rag_service.embedding_model_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
