// src/components/common/ToggleButton.tsx
import React from "react";
import { Minimize2, Maximize2 } from "lucide-react";

interface ToggleButtonProps {
  isExpanded: boolean;
  onClick: () => void;
  title?: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  isExpanded,
  onClick,
  title = isExpanded ? "Réduire" : "Agrandir",
}) => {
  return (
    <button
      onClick={onClick}
      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      title={title}
      aria-label={title}
    >
      {isExpanded ? (
        <Minimize2 size={18} className="text-gray-500" />
      ) : (
        <Maximize2 size={18} className="text-gray-500" />
      )}
    </button>
  );
};

export default ToggleButton;
