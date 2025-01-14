import React from "react";
import { Download } from "lucide-react";
import { useInstallPWA } from "../../hooks/useInstallPWA";

const InstallButton: React.FC = () => {
  const { supportsPWA, installPWA } = useInstallPWA();

  if (!supportsPWA) return null;

  return (
    <button
      onClick={installPWA}
      className="w-full text-left text-sm hover:bg-gray-100 flex items-center gap-2"
      aria-label="Installer l'application"
    >
      <Download size={16} />
      <span>Installer l'app</span>
    </button>
  );
};

export default InstallButton;
