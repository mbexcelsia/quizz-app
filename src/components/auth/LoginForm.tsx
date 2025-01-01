// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      setIsLoading(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Une erreur est survenue lors de la connexion');
    }
  };

  return (
    <div className="section">
      <h2 className="section-title mb-6">Connexion</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="select-label mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="player-name-input w-full"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="select-label mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="player-name-input w-full"
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="reset-button"
              disabled={isLoading}
            >
              Annuler
            </button>
          )}
          
          <button
            type="submit"
            className="random-button"
            disabled={isLoading}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;