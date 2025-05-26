import React, { useState } from "react";

interface InteractiveStarRatingProps {
  initialRating: number;
  onRate: (rating: number) => void;
  disabled?: boolean;
}

const InteractiveStarRating: React.FC<InteractiveStarRatingProps> = ({ initialRating, onRate, disabled }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState(initialRating);

  const handleClick = (rating: number) => {
    if (disabled) return;
    setSelected(rating);
    onRate(rating);
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-lg cursor-pointer ${
            (hovered !== null ? i < hovered : i < selected) ? "text-yellow-400" : "text-gray-300"
          }`}
          onMouseEnter={() => !disabled && setHovered(i + 1)}
          onMouseLeave={() => !disabled && setHovered(null)}
          onClick={() => handleClick(i + 1)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default InteractiveStarRating;
