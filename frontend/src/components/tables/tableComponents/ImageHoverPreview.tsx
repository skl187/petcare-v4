// components/ImageHoverPreview.tsx

import React, { useState } from "react";

interface ImageHoverPreviewProps {
  src: string;
  alt?: string;
  className?: string;
  popupSize?: number;
}

const ImageHoverPreview: React.FC<ImageHoverPreviewProps> = ({
  src,
  alt = "",
  className = "",
  popupSize = 150,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Small thumbnail */}
      <img src={src} alt={alt} className={className} />

      {/* Enlarged image to the right */}
      {isHovered && (
        <div
          className="absolute z-50 bg-white border border-gray-300 shadow-xl rounded-md p-1"
          style={{
            top: "50%",
            left: "calc(100% + 8px)", // Show beside the image with a small gap
            transform: "translateY(-50%)",
            width: popupSize,
            height: popupSize,
          }}
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover rounded-md"
          />
        </div>
      )}
    </div>
  );
};

export default ImageHoverPreview;
