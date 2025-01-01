// src/components/auth/AuthManager.tsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { User as FirebaseUser } from "firebase/auth";

type AuthView = "login" | "register" | "profile";

interface AuthManagerProps {
  onClose?: () => void;
}

const AuthManager: React.FC<AuthManagerProps> = ({ onClose }) => {
  const [view, setView] = useState<AuthView>("login");
  const { currentUser, userData, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const renderAuthenticatedView = () => {
    // Ajoutez le console.log ici, avant le return
    console.log("userData dans AuthManager:", userData);

    return (
      <div className="section">
        <h2 className="section-title mb-6">Profil Utilisateur</h2>

        <div className="space-y-4">
          <div>
            <label className="select-label">Nom d'utilisateur</label>
            <p className="mt-1">{userData?.displayName}</p>
          </div>

          <div>
            <label className="select-label">Email</label>
            <p className="mt-1">{currentUser?.email}</p>
          </div>

          <div>
            <label className="select-label">Statut</label>
            <p className="mt-1">
              {userData?.isAdmin ? "Administrateur" : "Utilisateur"}
            </p>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button onClick={handleLogout} className="reset-button">
              Se déconnecter
            </button>
            {onClose && (
              <button onClick={onClose} className="random-button">
                Fermer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderUnauthenticatedView = () => {
    if (view === "login") {
      return (
        <div>
          <LoginForm onSuccess={() => onClose?.()} onCancel={onClose} />
          <div className="text-center mt-4">
            <button
              onClick={() => setView("register")}
              className="text-primary-dark hover:underline"
            >
              Pas encore de compte ? S'inscrire
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <RegisterForm onSuccess={() => onClose?.()} onCancel={onClose} />
        <div className="text-center mt-4">
          <button
            onClick={() => setView("login")}
            className="text-primary-dark hover:underline"
          >
            Déjà un compte ? Se connecter
          </button>
        </div>
      </div>
    );
  };

  return currentUser ? renderAuthenticatedView() : renderUnauthenticatedView();
};

export default AuthManager;
