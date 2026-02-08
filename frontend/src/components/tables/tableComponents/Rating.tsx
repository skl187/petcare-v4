import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Rating({ 
  value, 
  max = 5, 
  size = "md", 
  className = "" 
}: RatingProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = value >= starValue;
        const isHalfFilled = value >= starValue - 0.5 && value < starValue;

        return (
          <span 
            key={index} 
            className={`${sizeClasses[size]} text-yellow-400 mx-0.5`}
          >
            {isFilled ? (
              <FaStar />
            ) : isHalfFilled ? (
              <FaStarHalfAlt />
            ) : (
              <FaRegStar />
            )}
          </span>
        );
      })}
      <span className="ml-1 text-sm text-gray-500">
        ({value.toFixed(1)})
      </span>
    </div>
  );
}