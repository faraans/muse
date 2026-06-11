import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8000";

const StarPicker = ({ rating, setRating }) => {
  const [hovered, setHovered] = useState(0);

  const handleMouseMove = (e, star) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const isLeft = e.clientX - left < width / 2;
    setHovered(isLeft ? star - 0.5 : star);
  };

  const handleClick = (e, star) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const isLeft = e.clientX - left < width / 2;
    setRating(isLeft ? star - 0.5 : star);
  };

  const display = hovered || rating;

  return (
    <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const full = display >= star;
        const half = !full && display >= star - 0.5;

        return (
          <button
            key={star}
            onMouseMove={(e) => handleMouseMove(e, star)}
            onClick={(e) => handleClick(e, star)}
            className="relative text-3xl w-8 h-8"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <span className="absolute inset-0 flex items-center justify-center text-neutral-600">★</span>
            {(full || half) && (
              <span
                className="absolute inset-0 flex items-center justify-center text-violet-400"
                style={{ clipPath: half ? "inset(0 50% 0 0)" : "none" }}
              >
                ★
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default function ReviewModal({ album, userId, displayName, onClose, onSaved, existing }) {
  const [rating, setRating] = useState(existing ? parseFloat(existing.rating) : 0);
  const [reviewText, setReviewText] = useState(existing?.review_text || "");
  const [isPrivate, setIsPrivate] = useState(!!existing?.is_private);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!rating) return;
    setSaving(true);
    try {
      await axios.post(`${BASE_URL}/review`, {
        userId,
        displayName: displayName || null,
        albumId: album.id,
        albumName: album.name,
        albumImage: album.images?.[0]?.url || null,
        rating,
        reviewText: reviewText.trim() || null,
        isPrivate,
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving review:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-neutral-800 rounded-xl p-6 w-full max-w-md mx-4 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Album info */}
        <div className="flex items-center gap-3">
          {album.images?.[0]?.url && (
            <img
              src={album.images[0].url}
              alt={album.name}
              className="w-14 h-14 rounded object-cover"
            />
          )}
          <div>
            <h2 className="text-white font-semibold">{album.name}</h2>
            <p className="text-neutral-400 text-sm">
              {album.artists?.map((a) => a.name).join(", ")}
            </p>
          </div>
        </div>

        {/* Half-star picker */}
        <StarPicker rating={rating} setRating={setRating} />
        {rating > 0 && (
          <p className="text-neutral-400 text-xs -mt-2">{rating} / 5</p>
        )}

        {/* Review text */}
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Add a review... (optional)"
          rows={4}
          className="w-full bg-neutral-700 text-white rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-violet-500"
        />

        {/* Private toggle */}
        <label className="flex items-center gap-2 text-neutral-400 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="accent-violet-500"
          />
          Make private
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white text-sm transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!rating || saving}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-sm px-5 py-2 rounded-lg transition duration-200"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
