import React, { useState } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { MdRateReview } from "react-icons/md";
import ReviewModal from "../components/ReviewModal";
import AlbumDetailModal from "../components/AlbumDetailModal";
import Stars from "../components/Stars";

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
          <div className="relative">
            {album.images.length ? (
              <img width={"100%"} src={album.images[0].url} alt="" />
            ) : (
              <img width={"100%"} src="default_album_image.png" alt="" />
            )}
            <div className="overlay" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => onLike(album, "album")}>
                {isLiked ? <AiFillHeart /> : <AiOutlineHeart />}
              </button>
              <button onClick={() => setShowReview(true)}>
                <MdRateReview />
              </button>
            </div>
          </div>
          {album.name}
        </div>
        {userReview && (
          <div className="flex items-center gap-1 mt-1">
            <Stars rating={parseFloat(userReview.rating)} size="xs" />
          </div>
        )}
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
