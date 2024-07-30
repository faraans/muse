// components/ArtistCard.js
import React from "react";
import { AiOutlineHeart, AiFillHeart, AiOutlineLink } from "react-icons/ai";

const ArtistCard = ({ artist, onLike, isLiked }) => {
  return (
    <div key={artist.id} className="artist-display">
      <a href={artist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
        {artist.images.length ? (
          <img width={"100%"} src={artist.images[0].url} alt="" />
        ) : (
          <img width={"100%"} src="default_artist_image.png" alt="" />
        )}
        {artist.name}
      </a>
      <div className="overlay">
        <button onClick={() => onLike(artist, "artist")}>
          {isLiked ? <AiFillHeart /> : <AiOutlineHeart />}
        </button>
        <a href={artist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
          <AiOutlineLink />
        </a>
      </div>
    </div>
  );
};

export default ArtistCard;
