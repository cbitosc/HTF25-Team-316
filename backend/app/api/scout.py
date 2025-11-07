"""
API endpoint for Scout Assistant - AI-powered chat for navigation and help
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/scout", tags=["scout"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ScoutChatRequest(BaseModel):
    message: str
    conversation_history: list[ChatMessage] = []


# Application structure and features
APP_STRUCTURE = """
## EduDash Platform Structure

### STUDENT PORTAL PAGES:
1. **Dashboard** (/)
   - Overview of activities, assignments, and progress
   - Quick stats: Overall grade, courses enrolled, upcoming deadlines
   - Recent assignments and materials preview
   - Direct navigation: Click "Dashboard" in sidebar or go to homepage

2. **Assignments** (/assignments)
   - View all assignments with due dates and status
   - Filter by course, status (pending/completed), due date
   - Submit assignments with file uploads
   - Track submission status and grades
   - Direct navigation: Sidebar > Assignments or type "assignments" in URL

3. **Study Materials** (/materials)
   - Browse all uploaded study materials by teachers
   - Filter by course, type (PDF, Video, Document)
   - Download materials for offline study
   - Preview materials before downloading
   - Search materials by title or tags
   - Direct navigation: Sidebar > Study Materials

4. **Analytics** (/analytics)
   - View your performance metrics and progress
   - Course-wise grade breakdown
   - Assignment completion rates
   - Progress charts and trends over time
   - Identify areas needing improvement
   - Direct navigation: Sidebar > Analytics

5. **Profile** (/profile)
   - View and edit your personal information
   - Update profile picture and contact details
   - Change password and account settings
   - Direct navigation: Click profile icon in top bar

6. **Feedback** (/feedback)
   - Submit feedback about courses or teachers
   - Anonymous feedback option available
   - Rate teaching quality and course content
   - Direct navigation: Type /feedback in URL

### TEACHER PORTAL PAGES:
1. **Teacher Dashboard** (/teacher)
   - Overview of all classes and student activities
   - Quick stats: Total students, courses, submissions
   - Recent activities and pending tasks
   - Direct navigation: Main dashboard for teachers

2. **Courses** (/teacher/courses)
   - View and manage all your courses/subjects
   - Create new courses with descriptions
   - Edit course details and settings
   - View enrolled students per course
   - Direct navigation: Sidebar > Courses

3. **Assignments** (/teacher/assignments)
   - Create new assignments with deadlines
   - View all assignments across courses
   - Edit or delete existing assignments
   - Set assignment parameters (due date, points, instructions)
   - Direct navigation: Sidebar > Assignments

4. **Submissions** (/teacher/submissions)
   - View all student submissions
   - Grade submitted assignments
   - Download student files
   - Provide feedback on submissions
   - Track submission rates
   - Direct navigation: Sidebar > Submissions

5. **Study Materials** (/teacher/study-materials)
   - Upload new study materials (PDFs, videos, documents)
   - Organize materials by course
   - Enable AI vectorization for RAG search
   - Edit or delete existing materials
   - View material access statistics
   - Direct navigation: Sidebar > Study Material

6. **Feedback Review** (/teacher/feedbacks)
   - View student feedback about your courses
   - Anonymous and identified feedback
   - Analyze feedback trends
   - Direct navigation: Sidebar > Feedback Review

7. **Student Analytics** (/teacher/student-analytics)
   - View individual student performance
   - Track class average and trends
   - Identify struggling students
   - Export analytics reports
   - Direct navigation: Sidebar > Student Analytics

### COMMON FEATURES:
- **Navigation Sidebar**: Click the ☰ menu icon (top-left) to access all pages
- **Profile Dropdown**: Click your profile picture (top-right) for account settings
- **RAG Search Assistant**: Click the floating 🔍 button (bottom-center) to search study materials using AI
- **Scout Assistant**: Click the floating 💬 button (bottom-right) for navigation help (that's me!)
- **Theme Toggle**: Dark/Light mode switch in top bar
- **Logout**: Available in profile dropdown

### NAVIGATION TIPS:
1. **Using Sidebar**: Fastest way - click ☰ menu and select any page
2. **Direct URLs**: Type /[page-name] in browser (e.g., /assignments)
3. **Keyboard Shortcuts**: 
   - Press "/" to focus search
   - Press "?" to open help
4. **Back to Dashboard**: Click logo or "Dashboard" in sidebar

### KEY ACTIONS BY ROLE:

**Students can:**
- View and submit assignments
- Access study materials
- Track their own analytics
- Submit feedback
- Download course resources

**Teachers can:**
- Create and manage courses
- Post assignments
- Upload study materials
- Grade submissions
- View student analytics
- Read student feedback

### SPECIAL FEATURES:
1. **RAG Search**: AI-powered search through vectorized study materials
2. **Real-time Updates**: Notifications for new assignments, grades
3. **File Management**: Upload/download PDFs, documents, videos
4. **Analytics Dashboard**: Visual charts and performance tracking
5. **Responsive Design**: Works on desktop, tablet, mobile
"""


@router.post("/chat")
async def scout_chat(request: ScoutChatRequest):
    """
    Scout Assistant chat endpoint - helps users navigate the dashboard
    and answer questions about assignments, courses, materials, etc.
    """
    try:
        # Initialize Gemini LLM
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.7  # Balanced for helpful responses
        )
        
        # Create system prompt for Scout with app structure
        system_prompt = f"""You are Scout, a friendly and helpful navigation assistant for the EduDash educational platform.

Your PRIMARY role is to help users NAVIGATE the platform and find the right pages/features.

{APP_STRUCTURE}

IMPORTANT INSTRUCTIONS:
1. **Focus on Navigation**: Your main job is to tell users WHERE to go and HOW to get there
2. **Be Specific**: Always provide exact navigation steps (e.g., "Click the ☰ menu > Assignments")
3. **Provide Direct Links**: When possible, tell users the URL path (e.g., "Go to /assignments")
4. **Use the Platform Info Above**: All page descriptions, features, and navigation are detailed above
5. **Short & Clear**: Keep responses to 2-3 sentences with clear action steps
6. **Guide, Don't Answer Data**: If they ask "What assignments do I have?", guide them to /assignments page instead of trying to answer
7. **Use Emojis Sparingly**: Only use relevant icons like 📚 🎓 📊 ✅

RESPONSE FORMAT:
- Start with a brief acknowledgment
- Provide navigation steps: "Click [Menu] > [Page]" or "Go to [URL]"
- Optionally explain what they'll find there

EXAMPLE RESPONSES:
❌ BAD: "You have 3 assignments due this week."
✅ GOOD: "To view your assignments, click the ☰ menu and select 'Assignments' or go to /assignments. There you'll see all your assignments with due dates and status."

❌ BAD: "Your grade is 85%."
✅ GOOD: "To check your grades and performance, go to Analytics in the sidebar (/analytics). You'll see detailed breakdowns and charts there."

❌ BAD: "Here are your study materials..."
✅ GOOD: "To access study materials, click ☰ menu > Study Materials (/materials). You can browse, filter, and download all course resources there."

Remember: You're a NAVIGATOR, not a data provider. Guide users to the right pages where they can see their actual data!"""

        # Build conversation context
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history (limit to last 6 exchanges for context)
        for msg in request.conversation_history[-12:]:
            messages.append({
                "role": "user" if msg.role == "user" else "assistant",
                "content": msg.content
            })
        
        # Add current message
        messages.append({"role": "user", "content": request.message})
        
        # Get response from Gemini
        full_prompt = "\n\n".join([
            f"{'System' if m['role'] == 'system' else m['role'].title()}: {m['content']}" 
            for m in messages
        ])
        
        response = llm.invoke(full_prompt)
        answer = response.content.strip()
        
        return {
            "response": answer,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Scout chat error: {str(e)}")
        # Return helpful fallback
        return {
            "response": "I'm having a bit of trouble right now. 🤔 To navigate quickly, click the ☰ menu (top-left) to see all available pages. Need assignments? Go to /assignments. Study materials? Try /materials. I'll be back to full functionality soon!",
            "success": True,
            "fallback": True
        }
