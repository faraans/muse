import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiOutlineLink } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import Stars from "./Stars";
import useEscapeKey from "../hooks/useEscapeKey";
import { BASE_URL } from "../constants";

export default function AlbumDetailModal({ album, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEscapeKey(onClose);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/reviews/album/${album.id}`)
      .then((res) => setReviews(res.data))
      .catch((err) => console.error("Error fetching album reviews:", err))
      .finally(() => setLoading(false));
  }, [album.id]);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-neutral-800 rounded-xl w-full max-w-md mx-4 flex flex-col max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Album header */}
        <div className="p-6 flex flex-col items-center text-center gap-3">
          {album.images?.[0]?.url && (
            <img
              src={album.images[0].url}
              alt={album.name}
              className="w-32 h-32 rounded object-cover"
            />
          )}
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">{album.name}</h2>
            <p className="text-neutral-400 text-sm mt-1">
              {album.artists?.map((a) => a.name).join(", ")}
            </p>
            <a
              href={album.external_urls?.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm mt-2 transition duration-200"
            >
              <AiOutlineLink /> Open in Spotify
            </a>
          </div>
        </div>

        <hr className="border-neutral-700" />

        {/* Reviews */}
        <div className="p-6 flex flex-col gap-4">
          <h3 className="text-violet-400 text-xs font-semibold uppercase tracking-wider">
            Reviews {reviews.length > 0 && `(${reviews.length})`}
          </h3>

          {loading ? (
            <p className="text-neutral-500 text-sm">Loading...</p>
          ) : reviews.length === 0 ? (
            <p className="text-neutral-500 italic text-sm">No public reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => { onClose(); navigate(`/user/${review.user_id}`); }}
                    className="text-white text-sm font-semibold hover:text-violet-400 transition duration-200"
                  >
                    {review.display_name || "Anonymous"}
                  </button>
                  <Stars rating={parseFloat(review.rating)} size="sm" />
                </div>
                {review.review_text && (
                  <p className="text-neutral-300 text-sm">{review.review_text}</p>
                )}
                <p className="text-neutral-600 text-xs">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
