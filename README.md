# EduDash - Educational Dashboard Platform

A comprehensive educational platform built with Next.js and FastAPI, featuring AI-powered learning assistance, assignment management, and analytics.

## 🚀 Features

### For Students
- **Dashboard**: Personalized dashboard with AI-generated motivational quotes
- **Assignments**: View assignments with deadline tracking and submission status
- **Study Materials**: Access course materials and resources
- **Analytics**: Track your performance and progress
- **Scout AI Assistant**: Get instant help with questions using RAG-powered AI
- **Smart Notifications**: Real-time notifications for new and urgent assignments

### For Teachers
- **Course Management**: Create and manage courses
- **Assignment Creation**: Create assignments with deadlines and descriptions
- **Material Upload**: Upload study materials for students
- **Student Analytics**: View student performance and progress
- **Feedback System**: Provide feedback to students
- **Submission Review**: Review student assignment submissions

### Core Features
- **Google Authentication**: Secure login with Google OAuth
- **Role-Based Access**: Separate interfaces for students and teachers
- **Real-time Updates**: Live notifications and updates
- **AI-Powered**: Gemini AI for motivational quotes and intelligent assistance
- **RAG System**: Retrieval-Augmented Generation for context-aware answers

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.0.0** with Turbopack
- **React** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Firebase Client SDK** for authentication
- **Axios** for API calls

### Backend
- **FastAPI** (Python)
- **MongoDB Atlas** with Beanie ODM
- **Firebase Admin SDK** for authentication
- **Google Gemini AI** (gemini-2.0-flash-exp)
- **LangChain** for RAG pipeline
- **FAISS** for vector search
- **Sentence Transformers** for embeddings

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- Python 3.12+
- MongoDB Atlas account
- Firebase project with Google Auth enabled
- Google AI API key (for Gemini)

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Manideep3183/HTF25-Team-316.git
cd HTF25-Team-316
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install
# or
pnpm install

# Create .env.local file
cp .env.example .env.local
```

Add your Firebase configuration to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

Add your configuration to `backend/.env`:

```env
# MongoDB
MONGODB_URL=your_mongodb_atlas_connection_string

# Firebase Admin
FIREBASE_CREDENTIALS=path_to_service_account.json
# OR use individual variables:
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id

# JWT
JWT_SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Google AI
GEMINI_API_KEY=your_gemini_api_key

# CORS
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## 🚀 Running the Application

### Start Backend

```bash
cd backend
python3 app/main.py
```

Backend will run on `http://localhost:8000`

### Start Frontend

```bash
# From project root
npm run dev
# or
pnpm dev
```

Frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
.
├── app/                    # Next.js app directory
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── assignments/       # Student assignments
│   ├── materials/         # Study materials
│   ├── analytics/         # Student analytics
│   ├── teacher/           # Teacher dashboard
│   └── ...
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard-page.tsx
│   ├── notifications-dropdown.tsx
│   ├── create-assignment-modal.tsx
│   ├── scout-assistant.tsx
│   └── ...
├── hooks/                # React hooks
│   ├── use-auth.tsx      # Authentication hook
│   └── ...
├── lib/                  # Utility libraries
│   ├── api.ts           # API client
│   ├── firebase.ts      # Firebase config
│   └── utils.ts
├── backend/             # FastAPI backend
│   ├── app/
│   │   ├── main.py     # FastAPI application
│   │   ├── api/        # API routes
│   │   ├── core/       # Core config
│   │   ├── models/     # Database models
│   │   └── schemas/    # Pydantic schemas
│   └── requirements.txt
└── public/             # Static assets
```

## 🔑 Key Features Explained

### Authentication System
- Firebase Authentication for secure login
- JWT tokens for API authorization
- Role-based access control (Student/Teacher/Admin)
- Google OAuth integration

### Assignment Management
- Create assignments with titles, descriptions, and deadlines
- View all assignments with filtering
- Track submission status
- Deadline reminders and notifications

### Notifications System
- Smart notification bell icon
- Highlights new assignments (last 24 hours)
- Urgent assignments (≤2 days deadline)
- Persistent notification state

### Scout AI Assistant
- Context-aware answers using RAG
- Searches through uploaded study materials
- Powered by Google Gemini AI
- Real-time chat interface

### Analytics Dashboard
- Student performance tracking
- Course progress visualization
- Assignment completion rates
- Grade analysis

## 🔒 Security

- Firebase Authentication for secure user management
- JWT tokens with refresh token rotation
- Role-based access control
- CORS protection
- Environment variable configuration
- Password hashing with bcrypt

## 📚 API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

HTF25-Team-316

## 📧 Support

For support, please open an issue on GitHub or contact the team.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Firebase](https://firebase.google.com/)
- [MongoDB](https://www.mongodb.com/)
- [Google Gemini AI](https://ai.google.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
