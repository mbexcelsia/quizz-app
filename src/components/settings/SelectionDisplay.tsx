// src/components/settings/SelectionDisplay.tsx
import React from "react";

interface SelectionDisplayProps {
  selections: string[];
  className?: string;
}

const SelectionDisplay: React.FC<SelectionDisplayProps> = ({
  selections,
  className = "",
}) => {
  if (!selections || selections.length === 0) {
    return null;
  }

  return (
    <div className={`mt-1 text-sm ${className}`}>
      <div className="flex flex-wrap gap-1">
        {selections.map((item) => (
          <span key={item} className="selection-tag">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SelectionDisplay;
