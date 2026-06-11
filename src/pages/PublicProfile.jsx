import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";

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

export default function PublicProfile({ accessToken, onLogout, userProfile }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/reviews/public/${userId}`)
      .then((res) => {
        setReviews(res.data);
        if (res.data.length > 0) setDisplayName(res.data[0].display_name || "");
      })
      .catch((err) => console.error("Error fetching public profile:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <>
      <Header
        userProfile={userProfile}
        accessToken={accessToken}
        onLogout={onLogout}
      />

      <div className="min-h-screen bg-neutral-900 text-white">
        <div className="h-36 bg-gradient-to-r from-violet-900 to-neutral-800" />

        <div className="max-w-4xl mx-auto px-6">
          <div className="relative -mt-10 mb-8 flex items-end gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-neutral-900 bg-violet-700 flex items-center justify-center text-3xl font-bold">
              {displayName.charAt(0) || "?"}
            </div>
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-white">{displayName || "User"}</h1>
              <p className="text-neutral-500 text-sm">{reviews.length} public review{reviews.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          <h2 className="text-violet-400 text-sm font-semibold uppercase tracking-wider mb-4">
            Reviews
          </h2>

          {loading ? (
            <p className="text-neutral-500 text-sm">Loading...</p>
          ) : reviews.length === 0 ? (
            <p className="text-neutral-500 italic text-sm">No public reviews yet.</p>
          ) : (
            <div className="flex flex-col gap-4 pb-16">
              {reviews.map((review) => (
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
                      <p className="text-neutral-600 text-xs flex-shrink-0">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {review.review_text && (
                      <p className="text-neutral-300 text-sm mt-1">{review.review_text}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
