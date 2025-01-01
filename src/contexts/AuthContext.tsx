// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { auth } from "../config/firebase";
import { authService } from "../services/authService";
import type { User } from "../config/firebase";

// Types
interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | null>(null);

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Composant Provider
export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dans AuthContext.tsx, modifions le useEffect pour la gestion de l'état d'authentification
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      async (user: FirebaseUser | null) => {
        setCurrentUser(user);
        try {
          if (user) {
            const data = await authService.getUserData(user.uid);
            console.log("Données utilisateur récupérées:", data); // Pour debug
            setUserData(data);
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error(
            "Erreur de récupération des données utilisateur:",
            error
          );
          setUserData(null);
        }
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user } = await authService.login(email, password);
      const data = await authService.getUserData(user.uid);
      setUserData(data);
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    try {
      const { user } = await authService.register(email, password, displayName);
      // Attendre explicitement la récupération des données
      const data = await authService.getUserData(user.uid);
      console.log("Données utilisateur après inscription:", data);
      setUserData(data);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setUserData(null);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}
