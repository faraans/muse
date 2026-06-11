import React, { useEffect, useState } from "react";
import axios from "axios";
import ReviewModal from "./ReviewModal";

const BASE_URL = "http://localhost:8000";

const Stars = ({ rating }) => (
  <span className="inline-flex">
    {[1, 2, 3, 4, 5].map((star) => {
      const full = rating >= star;
      const half = !full && rating >= star - 0.5;
      return (
        <span key={star} className="relative text-lg w-5 h-5 inline-flex items-center justify-center">
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

export default function UserReviews({ userId, displayName }) {
  const [reviews, setReviews] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${BASE_URL}/reviews/user/${userId}`)
      .then((res) => setReviews(res.data))
      .catch((err) => console.error("Error fetching reviews:", err));
  }, [userId]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/review/${id}`, { data: { userId } });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  const handleEditSaved = async () => {
    const res = await axios.get(`${BASE_URL}/reviews/user/${userId}`);
    setReviews(res.data);
    setEditing(null);
  };

  if (reviews.length === 0) {
    return <p className="text-neutral-500 italic text-sm">No reviews yet.</p>;
  }

  const visible = showAll ? reviews : reviews.slice(0, 3);

  return (
    <>
      <div className="flex flex-col gap-4">
        {visible.map((review) => (
          <div key={review.id} className="bg-neutral-800 rounded-xl p-4 flex gap-4">
            {review.album_image && (
              <img
                src={review.album_image}
                alt={review.album_name}
                className="w-14 h-14 rounded object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-white text-sm font-semibold truncate">{review.album_name}</p>
                  <Stars rating={parseFloat(review.rating)} />
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {!!review.is_private && (
                    <span className="text-neutral-500 text-xs">Private</span>
                  )}
                  <button
                    onClick={() => setEditing(review)}
                    className="text-neutral-500 hover:text-white text-xs transition duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-neutral-500 hover:text-red-400 text-xs transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {review.review_text && (
                <p className="text-neutral-300 text-sm mt-1">{review.review_text}</p>
              )}
            </div>
          </div>
        ))}
        {reviews.length > 3 && (
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="text-violet-400 hover:text-violet-300 text-sm transition duration-200 text-left"
          >
            {showAll ? "Show less" : `Show all ${reviews.length} reviews`}
          </button>
        )}
      </div>

      {editing && (
        <ReviewModal
          album={{
            id: editing.album_id,
            name: editing.album_name,
            images: editing.album_image ? [{ url: editing.album_image }] : [],
            artists: [],
          }}
          userId={userId}
          displayName={displayName}
          existing={editing}
          onClose={() => setEditing(null)}
          onSaved={handleEditSaved}
        />
      )}
    </>
  );
}
