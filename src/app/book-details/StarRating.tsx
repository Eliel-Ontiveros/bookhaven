import React from "react";

interface StarRatingProps {
  rating: number;
  max?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, max = 5 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={"full-" + i} className="text-yellow-400 text-lg">★</span>
      ))}
      {hasHalfStar && <span className="text-yellow-400 text-lg">☆</span>}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span key={"empty-" + i} className="text-gray-300 text-lg">★</span>
      ))}
    </div>
  );
};

export default StarRating;
