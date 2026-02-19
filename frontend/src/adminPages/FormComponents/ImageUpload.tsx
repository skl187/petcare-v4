import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

export interface ImageUploadProps {
  label?: string;
  value?: File | string | null;
  onChange: (file: File | null) => void;
  maxSizeMB?: number;
  accept?: string;
  shape?: "circle" | "rounded";
  size?: "sm" | "md" | "lg";
  sizeClassName?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  imageClassName?: string;
  showRemove?: boolean;
  controlsMode?: "overlay" | "buttons";
}

const SIZE_MAP: Record<NonNullable<ImageUploadProps["size"]>, string> = {
  sm: "w-24 h-24",
  md: "w-32 h-32",
  lg: "w-40 h-40",
};

// inline SVG icons
const PlusIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PencilIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor" />
    <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor" />
  </svg>
);

const ImageUpload: React.FC<ImageUploadProps> = ({
  label = "Upload Image",
  value,
  onChange,
  maxSizeMB = 2,
  accept = "image/*",
  shape = "rounded",
  size = "md",
  sizeClassName,
  disabled = false,
  id,
  className,
  imageClassName,
  showRemove = true,
  controlsMode = "overlay",
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(typeof value === "string" ? value : null);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (!value) {
      setPreview(null);
      return;
    }
    if (typeof value === "string") {
      setPreview(value);
      return;
    }
    objectUrl = URL.createObjectURL(value);
    setPreview(objectUrl);
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [value]);

  // outside click / escape close
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    const onClick = () => setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [menuOpen]);

  const shapeClasses = shape === "circle" ? "rounded-full" : "rounded-lg";
  const containerSize = sizeClassName ?? SIZE_MAP[size];
  const hasImage = !!preview;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be less than ${maxSizeMB} MB`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setMenuOpen(false);
    onChange(file);
  };

  const handleRemove = () => {
    setError(null);
    onChange(null);
    setMenuOpen(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const inputId = useMemo(() => id ?? `image-upload-${Math.random().toString(36).slice(2)}`, [id]);

  return (
    <div className={clsx("flex flex-col items-center space-y-3", className)}>
      <div className="relative inline-block">
        {/* preview box */}
        <div
          className={clsx(
            "bg-gray-100 border border-gray-200 overflow-hidden",
            "flex items-center justify-center aspect-square",
            shapeClasses,
            containerSize
          )}
        >
          {hasImage ? (
            <img
              src={preview!}
              alt="photo"
              className={clsx("w-full h-full object-cover", shapeClasses, imageClassName, "pointer-events-none")}
            />
          ) : (
            <span className="text-gray-400 text-sm select-none">No image</span>
          )}
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={accept}
            className="hidden"
            disabled={disabled}
            onChange={handleFileChange}
          />
        </div>

        {/* overlay controls */}
        {controlsMode === "overlay" && !disabled && (
          <div className="absolute top-1.5 right-1.5 z-20">
            {!hasImage ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className={clsx(
                  "inline-flex items-center justify-center h-8 w-8 rounded-full shadow-sm",
                  "bg-emerald-600 hover:bg-emerald-700 text-white",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-400"
                )}
                aria-label={label}
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent immediate close
                    setMenuOpen((s) => !s);
                  }}
                  className={clsx(
                    "inline-flex items-center justify-center h-8 w-8 rounded-full shadow-sm",
                    "bg-indigo-600 hover:bg-indigo-700 text-white ring-1 ring-black/10",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  )}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label="Edit image"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    onClick={(e) => e.stopPropagation()} // keep menu open when clicking inside
                    className="absolute right-0 mt-2 w-36 rounded-md border border-gray-200 bg-white shadow-lg z-30"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => inputRef.current?.click()}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Change image…
                    </button>
                    {showRemove && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleRemove}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* BUTTON MODE */}
      {controlsMode === "buttons" && (
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <label
            htmlFor={inputId}
            className={clsx(
              "px-4 py-2 text-center rounded-md transition",
              "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer",
              disabled && "opacity-60 cursor-not-allowed"
            )}
            aria-disabled={disabled}
          >
            {hasImage ? "Change Image" : label}
          </label>
          {hasImage && showRemove && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className={clsx(
                "px-4 py-2 rounded-md border transition",
                "text-red-600 border-red-200 hover:bg-red-50",
                disabled && "opacity-60 cursor-not-allowed"
              )}
            >
              Remove
            </button>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600" aria-live="polite">{error}</p>}
    </div>
  );
};

export default ImageUpload;
