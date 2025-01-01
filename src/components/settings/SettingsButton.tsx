// src/components/settings/SettingsButton.tsx
import React, { useState, useRef } from "react";
import { Settings } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import SettingsMenu from "./SettingsMenu";

interface SettingsButtonProps {
  onAdminClick: () => void;
  onStatsClick: () => void; // Nouvelle prop
}

const SettingsButton: React.FC<SettingsButtonProps> = ({
  onAdminClick,
  onStatsClick,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userData } = useAuth();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fermer le menu au clic à l'extérieur
  const handleClickOutside = (event: MouseEvent) => {
    if (
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setIsMenuOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 player-name-input"
        aria-label="Paramètres"
      >
        <Settings size={18} />
      </button>

      {isMenuOpen && (
        <SettingsMenu
          isAdmin={userData?.isAdmin || false}
          onClose={() => setIsMenuOpen(false)}
          onAdminClick={onAdminClick}
          onStatsClick={onStatsClick} // Nouvelle prop
        />
      )}
    </div>
  );
};
export default SettingsButton;
