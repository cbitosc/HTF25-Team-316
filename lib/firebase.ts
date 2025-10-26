// Firebase configuration
// This is the client-side Firebase config for the frontend
// Safe to commit to version control (these are public keys)

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCvXU-oaGWs3nHfuTYeBIrLPnZLZo7ohzw",
  authDomain: "edudash-4f7ef.firebaseapp.com",
  projectId: "edudash-4f7ef",
  storageBucket: "edudash-4f7ef.firebasestorage.app",
  messagingSenderId: "42662942491",
  appId: "1:42662942491:web:732b4c6a5f38da86b8a5be",
  measurementId: "G-L3VH94KETD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
