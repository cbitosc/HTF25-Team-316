"""
API endpoint for generating motivational quotes using Gemini LLM
"""
from fastapi import APIRouter, HTTPException
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/quote", tags=["quote"])


@router.get("/motivational")
async def get_motivational_quote():
    """
    Generate a motivational quote for students/teachers using Gemini LLM.
    Returns a different quote each time it's called.
    """
    try:
        # Initialize Gemini LLM
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.9  # Higher temperature for more creative/varied responses
        )
        
        # Prompt for generating motivational quotes
        prompt = """Generate a short, inspiring motivational quote for students and teachers in education.
The quote should be:
- Brief (1-2 sentences max)
- Uplifting and positive
- Related to learning, growth, or achievement
- Suitable for an educational platform
- Different each time (be creative and varied)

Just provide the quote itself, without any additional commentary or quotation marks."""

        # Generate the quote
        response = llm.invoke(prompt)
        quote = response.content.strip()
        
        # Remove any quotation marks that might have been added
        quote = quote.strip('"\'')
        
        return {
            "quote": quote,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Failed to generate motivational quote: {str(e)}")
        # Return a fallback quote if Gemini fails
        fallback_quotes = [
            "Every expert was once a beginner. Keep learning, keep growing! 🌱",
            "Success is the sum of small efforts repeated day in and day out. 💪",
            "The beautiful thing about learning is that no one can take it away from you. 📚",
            "Education is not preparation for life; education is life itself. ✨",
            "Your potential is endless. Go do what you were created to do! 🚀"
        ]
        import random
        return {
            "quote": random.choice(fallback_quotes),
            "success": True,
            "fallback": True
        }
