// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD_oUgNOYEUTX50jr05mikLkYFo7j7sYm4",
  authDomain: "quiz-educatif-d4488.firebaseapp.com",
  projectId: "quiz-educatif-d4488",
  storageBucket: "quiz-educatif-d4488.firebasestorage.app",
  messagingSenderId: "334223901767",
  appId: "1:334223901767:web:570146ed4ac5102af61d62",
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Initialisation des services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Types pour TypeScript
export interface User {
  uid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  createdAt: Date;
  lastLogin: Date;
}

export interface PlayerProfile {
  uid: string;
  name: string;
  selections: {
    mainTopics: string[];
    subTopics: string[];
    subSubTopics: string[];
    mainLevels: number[];
    subLevels: string[];
    subSubLevels: string[];
  };
}
