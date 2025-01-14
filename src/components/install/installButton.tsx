import React from "react";
import { Download } from "lucide-react";
import { useInstallPWA } from "../../hooks/useInstallPWA";

const InstallButton: React.FC = () => {
  const { supportsPWA, installPWA } = useInstallPWA();

  if (!supportsPWA) return null;

  return (
    <button
      onClick={installPWA}
      className="flex items-center gap-2 player-name-input"
      aria-label="Installer l'application"
    >
      <Download size={18} />
      <span>Installer l'app</span>
    </button>
  );
};

export default InstallButton;
