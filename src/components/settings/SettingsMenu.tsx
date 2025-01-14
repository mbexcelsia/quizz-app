import React from "react";
import { Shield, BarChart2, Download } from "lucide-react";
import InstallButton from "../install/installButton";

interface SettingsMenuProps {
  isAdmin: boolean;
  onClose: () => void;
  onAdminClick: () => void;
  onStatsClick: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  isAdmin,
  onClose,
  onAdminClick,
  onStatsClick,
}) => {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
      <div className="py-1">
        <button
          onClick={() => {
            onStatsClick();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
        >
          <BarChart2 size={16} />
          <span>Statistiques</span>
        </button>

        {/* Bouton d'installation PWA */}
        <div className="w-full px-4 py-2">
          <InstallButton />
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              onAdminClick();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-primary"
          >
            <Shield size={16} />
            <span>Administration</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SettingsMenu;
