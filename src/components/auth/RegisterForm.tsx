// src/components/auth/RegisterForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onCancel }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, displayName);
      setIsLoading(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    }
  };

  return (
    <div className="section">
      <h2 className="section-title mb-6">Inscription</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="displayName" className="select-label mb-2">
            Nom d'utilisateur
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="player-name-input w-full"
            required
            disabled={isLoading}
          />
        </div>

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
            minLength={6}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="select-label mb-2">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="player-name-input w-full"
            required
            disabled={isLoading}
            minLength={6}
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
            {isLoading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;