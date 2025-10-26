# Educational Dashboard Backend

FastAPI backend with Firebase Authentication and MongoDB for the Educational Dashboard application.

## Architecture

- **FastAPI**: Modern Python web framework for building APIs
- **Firebase Admin SDK**: For user authentication and management
- **MongoDB**: NoSQL database for storing user data, courses, assignments, etc.
- **Motor**: Async MongoDB driver for FastAPI
- **Beanie ODM**: Object-Document Mapper for MongoDB
- **JWT**: JSON Web Tokens for API authentication

## Features

- ✅ User registration and authentication with Firebase
- ✅ Role-based access control (Student, Teacher, Admin)
- ✅ JWT token generation and validation
- ✅ MongoDB integration with Beanie ODM
- ✅ RESTful API endpoints
- ✅ CORS enabled for frontend integration
- ✅ Async/await support throughout

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── dependencies.py      # Auth dependencies and middleware
│   │   └── routes/
│   │       └── auth.py           # Authentication endpoints
│   ├── core/
│   │   ├── config.py             # Application configuration
│   │   ├── database.py           # MongoDB connection
│   │   ├── firebase.py           # Firebase Admin SDK
│   │   └── security.py           # JWT and password hashing
│   ├── models/
│   │   ├── user.py               # User model
│   │   ├── assignment.py         # Assignment model
│   │   ├── material.py           # Study material model
│   │   ├── course.py             # Course model
│   │   ├── submission.py         # Assignment submission model
│   │   └── performance.py        # Student performance model
│   ├── schemas/
│   │   └── auth.py               # Pydantic schemas for requests/responses
│   └── main.py                   # FastAPI application entry point
├── .env.example                  # Environment variables template
└── requirements.txt              # Python dependencies
```

## Setup Instructions

### 1. Prerequisites

- Python 3.9 or higher
- MongoDB installed locally or MongoDB Atlas account
- Firebase project with Admin SDK credentials

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

#### MongoDB Setup

If using MongoDB locally:
```
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=educational_dashboard
```

If using MongoDB Atlas:
```
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=educational_dashboard
```

#### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to Project Settings > Service Accounts
4. Generate a new private key (JSON file)
5. Copy the values from the JSON file to your `.env`:

```
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=your-client-cert-url
```

6. Also add Firebase Web API config (from Project Settings > General):

```
FIREBASE_API_KEY=your-web-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

#### JWT Setup

Generate a secure random secret key:

```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or online: https://generate-secret.vercel.app/32
```

```
JWT_SECRET_KEY=your-super-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

#### CORS Setup

```
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 4. Run the Application

#### Development Mode (with auto-reload)

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or using the main.py directly:

```bash
python -m app.main
```

#### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc
- Health Check: http://localhost:8000/health

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login with email/password | No |
| POST | `/api/auth/login/firebase` | Login with Firebase ID token | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/me` | Get current user info | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Example: Register User

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePassword123!",
    "display_name": "John Doe",
    "role": "student",
    "student_id": "STU001",
    "grade": "10"
  }'
```

### Example: Login

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePassword123!"
  }'
```

### Example: Get Current User (with JWT)

```bash
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## User Roles

The system supports three roles:

1. **Student**: Can view assignments, submit work, view materials, track progress
2. **Teacher**: Can create assignments, grade submissions, upload materials, view analytics
3. **Admin**: Full system access

## Database Models

### User Model
- Firebase UID (unique)
- Email, display name, role
- Student fields: student_id, grade, enrolled_courses
- Teacher fields: teacher_id, department, teaching_courses

### Course Model
- Course code, name, description
- Teacher assignment
- Student enrollment
- Schedule and room information

### Assignment Model
- Title, description, due date
- Course and teacher association
- Status (draft, published, closed)
- Total points and passing threshold

### Material Model
- Study materials (PDF, video, links)
- Course and teacher association
- Type, tags, category
- Access control and analytics

### Submission Model
- Student assignment submissions
- Grading and feedback
- Late submission tracking
- Resubmission support

### Performance Model
- Student performance tracking
- Course-specific metrics
- Grade distribution
- Engagement analytics

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication (30-minute access, 7-day refresh)
- ✅ Firebase Admin SDK for user management
- ✅ Role-based access control
- ✅ CORS protection
- ✅ HTTPBearer security scheme
- ✅ Token validation middleware

## Frontend Integration

### Setup Authentication in Next.js

1. Install Firebase Client SDK:
```bash
npm install firebase
```

2. Create Firebase config:
```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

3. Create API client:
```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

4. Use in components:
```typescript
import api from '@/lib/api';

// Register
const response = await api.post('/auth/register', {
  email, password, display_name, role
});

// Store tokens
localStorage.setItem('access_token', response.data.access_token);
localStorage.setItem('refresh_token', response.data.refresh_token);

// Get current user
const user = await api.get('/auth/me');
```

## Testing

### Test Health Endpoint
```bash
curl http://localhost:8000/health
```

### Test Database Connection
The application will log MongoDB connection status on startup:
```
✅ Connected to MongoDB successfully
```

### Test Firebase Connection
The application will initialize Firebase Admin SDK on startup.

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env`
- For Atlas, whitelist your IP address

### Firebase Issues
- Verify service account JSON is correct
- Ensure private key includes `\n` for line breaks
- Check Firebase project is active

### Import Errors
- Ensure all packages are installed: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.9+)

### CORS Errors
- Add your frontend URL to `CORS_ORIGINS` in `.env`
- Restart the server after changing environment variables

## Next Steps

- [ ] Add user management endpoints (update profile, delete account)
- [ ] Implement course endpoints (CRUD operations)
- [ ] Add assignment endpoints (create, list, update, delete)
- [ ] Create submission endpoints (submit, grade, view)
- [ ] Build material endpoints (upload, download, view)
- [ ] Add analytics endpoints (student performance, course stats)
- [ ] Implement file upload (assignments, materials)
- [ ] Add real-time notifications (assignment due dates, grades)
- [ ] Create admin dashboard endpoints
- [ ] Add email notifications (welcome, password reset)

## License

MIT
