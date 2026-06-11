import React, { useState } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { MdRateReview } from "react-icons/md";
import ReviewModal from "../components/ReviewModal";
import AlbumDetailModal from "../components/AlbumDetailModal";

const StarDisplay = ({ rating }) => (
  <span className="inline-flex">
    {[1, 2, 3, 4, 5].map((star) => {
      const full = rating >= star;
      const half = !full && rating >= star - 0.5;
      return (
        <span key={star} className="relative text-xs w-3 h-3 inline-flex items-center justify-center">
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

const AlbumCard = ({ album, onLike, isLiked, userId, displayName, userReview, onReviewSaved }) => {
  const [showReview, setShowReview] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div className="artist-display">
        <div
          className="cursor-pointer"
          onClick={() => setShowDetail(true)}
        >
          {album.images.length ? (
            <img width={"100%"} src={album.images[0].url} alt="" />
          ) : (
            <img width={"100%"} src="default_album_image.png" alt="" />
          )}
          {album.name}
        </div>
        {userReview && (
          <div className="flex items-center gap-1 mt-1">
            <StarDisplay rating={parseFloat(userReview.rating)} />
          </div>
        )}
        <div className="overlay">
          <button onClick={() => onLike(album, "album")}>
            {isLiked ? <AiFillHeart /> : <AiOutlineHeart />}
          </button>
          <button onClick={() => setShowReview(true)}>
            <MdRateReview />
          </button>
        </div>
      </div>

      {showReview && (
        <ReviewModal
          album={album}
          userId={userId}
          displayName={displayName}
          onClose={() => setShowReview(false)}
          onSaved={onReviewSaved}
        />
      )}
      {showDetail && (
        <AlbumDetailModal
          album={album}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
};

export default AlbumCard;
