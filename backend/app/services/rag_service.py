"""
RAG (Retrieval Augmented Generation) Service
Uses Google's Gemini 2.0 Flash model with FAISS vector store for document Q&A
"""

import os
import fitz  # PyMuPDF
from typing import List, Dict, Optional, Any
from pathlib import Path
import pickle

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_classic.chains.retrieval import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document

from app.core.config import settings


class RAGService:
    """Service for handling RAG operations with study materials"""
    
    def __init__(self):
        """Initialize RAG service with Gemini LLM and embeddings"""
        self.google_api_key = settings.GOOGLE_API_KEY
        self.model_name = settings.RAG_MODEL
        self.embedding_model_name = settings.EMBEDDING_MODEL
        self.vector_store_path = Path(settings.VECTOR_STORE_PATH)
        self.chunk_size = settings.CHUNK_SIZE
        self.chunk_overlap = settings.CHUNK_OVERLAP
        
        # Ensure vector store directory exists
        self.vector_store_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize embeddings model
        self.embeddings = HuggingFaceEmbeddings(
            model_name=self.embedding_model_name,
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        
        # Initialize Google Gemini LLM
        if not self.google_api_key:
            print("⚠️  Google API key not configured. RAG service will not work.")
            self.llm = None
        else:
            try:
                self.llm = ChatGoogleGenerativeAI(
                    model=self.model_name,
                    google_api_key=self.google_api_key,
                    temperature=0.3,
                    max_output_tokens=2048,
                    convert_system_message_to_human=True
                )
                print(f"✅ Gemini LLM initialized successfully with model: {self.model_name}")
            except Exception as e:
                print(f"⚠️  Failed to initialize Gemini LLM: {str(e)}")
                self.llm = None
        
        # Text splitter for chunking documents
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        
        # Cache for vector stores by material_id
        self.vector_stores: Dict[str, FAISS] = {}
    
    async def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text content from PDF file
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Extracted text content
        """
        try:
            doc = fitz.open(pdf_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    async def chunk_text(self, text: str, metadata: Dict = None) -> List[Document]:
        """
        Split text into chunks for embedding
        
        Args:
            text: Text content to chunk
            metadata: Optional metadata to attach to chunks
            
        Returns:
            List of Document objects with chunks
        """
        chunks = self.text_splitter.split_text(text)
        documents = [
            Document(page_content=chunk, metadata=metadata or {})
            for chunk in chunks
        ]
        return documents
    
    async def vectorize_material(
        self,
        material_id: str,
        file_path: str,
        metadata: Dict = None
    ) -> Dict[str, Any]:
        """
        Extract text from PDF, chunk it, and create vector embeddings
        
        Args:
            material_id: Unique identifier for the material
            file_path: Path to the PDF file
            metadata: Optional metadata (title, course_id, etc.)
            
        Returns:
            Dictionary with vectorization results
        """
        try:
            # Extract text from PDF
            text = await self.extract_text_from_pdf(file_path)
            
            if not text.strip():
                raise Exception("No text content found in PDF")
            
            # Add material_id to metadata
            if metadata is None:
                metadata = {}
            metadata['material_id'] = material_id
            metadata['file_path'] = file_path
            
            # Chunk the text
            documents = await self.chunk_text(text, metadata)
            
            # Create vector store
            vector_store = FAISS.from_documents(documents, self.embeddings)
            
            # Save vector store to disk
            vector_store_file = self.vector_store_path / f"{material_id}.faiss"
            vector_store.save_local(str(vector_store_file))
            
            # Cache in memory
            self.vector_stores[material_id] = vector_store
            
            return {
                "success": True,
                "material_id": material_id,
                "num_chunks": len(documents),
                "total_characters": len(text),
                "vector_store_path": str(vector_store_file)
            }
            
        except Exception as e:
            raise Exception(f"Error vectorizing material: {str(e)}")
    
    async def get_vector_store(self, material_id: str) -> Optional[FAISS]:
        """
        Get or load a vector store for a specific material
        """
        # Check if already loaded in memory
        if material_id in self.vector_stores:
            return self.vector_stores[material_id]
        
        # Try to load from disk
        store_path = Path(self.vector_store_path) / f"{material_id}.faiss"
        print(f"DEBUG: Looking for vector store at: {store_path}")
        
        if store_path.exists():
            try:
                vector_store = FAISS.load_local(
                    str(store_path),
                    self.embeddings,
                    allow_dangerous_deserialization=True
                )
                self.vector_stores[material_id] = vector_store
                print(f"DEBUG: Successfully loaded vector store for {material_id}")
                return vector_store
            except Exception as e:
                print(f"ERROR: Failed to load vector store for {material_id}: {str(e)}")
                return None
        else:
            print(f"ERROR: Vector store path does not exist: {store_path}")
        
        return None
    
    async def query_material(
        self,
        material_id: str,
        query: str,
        num_results: int = 5,
        temperature: float = 0.3
    ) -> Dict[str, Any]:
        """
        Query a specific material using RAG
        
        Args:
            material_id: Unique identifier for the material
            query: User's question
            num_results: Number of relevant chunks to retrieve
            temperature: Creativity level (0.0 = precise, 1.0 = creative)
            
        Returns:
            Dictionary with answer and source chunks
        """
        try:
            # Get vector store
            vector_store = await self.get_vector_store(material_id)
            if vector_store is None:
                return {
                    "success": False,
                    "error": "Material not found or not vectorized"
                }
            
            # Create LLM with custom temperature
            llm = ChatGoogleGenerativeAI(
                model=self.model_name,
                google_api_key=self.google_api_key,
                temperature=temperature,
                max_output_tokens=2048,
                convert_system_message_to_human=True
            )
            
            # Create custom prompt template
            prompt_template = """Use the following pieces of context from the study material to answer the question at the end. 
If you don't know the answer based on the context, just say that you don't know, don't try to make up an answer.
Always provide specific references to the material when possible.

Context:
{context}

Question: {input}"""
            
            prompt = ChatPromptTemplate.from_template(prompt_template)
            
            # Create document combining chain
            combine_docs_chain = create_stuff_documents_chain(llm, prompt)
            
            # Create retrieval chain
            retriever = vector_store.as_retriever(search_kwargs={"k": num_results})
            qa_chain = create_retrieval_chain(retriever, combine_docs_chain)
            
            # Get answer
            result = qa_chain.invoke({"input": query})
            
            # Extract source information
            sources = []
            for doc in result.get('context', []):
                sources.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata
                })
            
            return {
                "success": True,
                "answer": result['answer'],
                "sources": sources,
                "material_id": material_id
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error querying material: {str(e)}"
            }
    
    async def query_multiple_materials(
        self,
        material_ids: List[str],
        query: str,
        num_results: int = 3,
        temperature: float = 0.3
    ) -> Dict[str, Any]:
        """
        Query multiple materials at once
        
        Args:
            material_ids: List of material identifiers
            query: User's question
            num_results: Number of relevant chunks per material
            temperature: Creativity level (0.0 = precise, 1.0 = creative)
            
        Returns:
            Dictionary with combined answer and sources
        """
        try:
            all_documents = []
            material_map = {}
            missing_materials = []
            
            print(f"DEBUG: Querying {len(material_ids)} materials: {material_ids}")
            
            # Collect documents from all materials
            for material_id in material_ids:
                vector_store = await self.get_vector_store(material_id)
                if vector_store:
                    # Search this vector store
                    docs = vector_store.similarity_search(query, k=num_results)
                    print(f"DEBUG: Found {len(docs)} documents in material {material_id}")
                    for doc in docs:
                        doc.metadata['material_id'] = material_id
                        all_documents.append(doc)
                        material_map[material_id] = True
                else:
                    print(f"DEBUG: Vector store not found for material {material_id}")
                    missing_materials.append(material_id)
            
            if not all_documents:
                error_msg = f"No vectorized materials found. "
                if missing_materials:
                    error_msg += f"Materials {', '.join(missing_materials[:3])} are not vectorized. "
                error_msg += "Please ensure materials are uploaded with 'Vectorize for AI' enabled."
                print(f"DEBUG: {error_msg}")
                return {
                    "success": False,
                    "error": error_msg
                }
            
            # Create a temporary vector store with all documents
            combined_store = FAISS.from_documents(all_documents, self.embeddings)
            
            # Check if Google API key is available
            if not self.google_api_key:
                return {
                    "success": False,
                    "error": "Google API key not configured. Please check server configuration."
                }
            
            # Create LLM with custom temperature
            llm = ChatGoogleGenerativeAI(
                model=self.model_name,
                google_api_key=self.google_api_key,
                temperature=temperature,
                max_output_tokens=2048,
                convert_system_message_to_human=True
            )
            
            # Create QA chain with new API
            prompt_template = """Use the following pieces of context from multiple study materials to answer the question.
If you don't know the answer, just say so. When answering, try to reference which material the information comes from.

Context:
{context}

Question: {input}"""
            
            prompt = ChatPromptTemplate.from_template(prompt_template)
            
            # Create document combining chain
            combine_docs_chain = create_stuff_documents_chain(llm, prompt)
            
            # Create retrieval chain
            retriever = combined_store.as_retriever(search_kwargs={"k": num_results * len(material_ids)})
            qa_chain = create_retrieval_chain(retriever, combine_docs_chain)
            
            # Get answer
            result = qa_chain.invoke({"input": query})
            
            # Extract source information
            sources = []
            for doc in result.get('context', []):
                sources.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata
                })
            
            return {
                "success": True,
                "answer": result['answer'],
                "sources": sources,
                "material_ids": list(material_map.keys()),
                "num_materials_searched": len(material_map)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error querying materials: {str(e)}"
            }
    
    async def delete_material_vectors(self, material_id: str) -> bool:
        """
        Delete vector store for a material
        
        Args:
            material_id: Unique identifier for the material
            
        Returns:
            True if deleted successfully
        """
        try:
            # Remove from cache
            if material_id in self.vector_stores:
                del self.vector_stores[material_id]
            
            # Delete from disk
            vector_store_file = self.vector_store_path / f"{material_id}.faiss"
            if vector_store_file.exists():
                # FAISS saves multiple files
                for file in vector_store_file.parent.glob(f"{material_id}.faiss*"):
                    file.unlink()
            
            return True
        except Exception as e:
            print(f"Error deleting material vectors: {str(e)}")
            return False


# Singleton instance
_rag_service = None

def get_rag_service() -> RAGService:
    """Get or create RAG service singleton"""
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service
