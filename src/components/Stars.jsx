import React from "react";

const SIZES = {
  xs: "text-xs w-3 h-3",
  sm: "text-sm w-4 h-4",
  lg: "text-lg w-5 h-5",
};

export default function Stars({ rating, size = "lg" }) {
  const sizeClass = SIZES[size] ?? SIZES.lg;
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((star) => {
        const full = rating >= star;
        const half = !full && rating >= star - 0.5;
        return (
          <span key={star} className={`relative ${sizeClass} inline-flex items-center justify-center`}>
            <span className="absolute inset-0 flex items-center justify-center text-neutral-600">★</span>
            {(full || half) && (
              <span
                className="absolute inset-0 flex items-center justify-center text-violet-400"
                style={{ clipPath: half ? "inset(0 50% 0 0)" : "none" }}
              >
                ★
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
