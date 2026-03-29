import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ricky-chat-app-d0412.firebaseapp.com",
  projectId: "ricky-chat-app-d0412",
  storageBucket: "ricky-chat-app-d0412.firebasestorage.app",
  messagingSenderId: "695089387655",
  appId: "1:695089387655:web:0357cc6d7c0021af6ac022",
  measurementId: "G-PB1JYR0786"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
