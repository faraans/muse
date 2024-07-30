// components/AlbumCard.js
import React from "react";
import { AiOutlineHeart, AiFillHeart, AiOutlineLink } from "react-icons/ai";

const AlbumCard = ({ album, onLike, isLiked }) => {
  return (
    <div key={album.id} className="artist-display">
      <a href={album.external_urls.spotify} target="_blank" rel="noopener noreferrer">
        {album.images.length ? (
          <img width={"100%"} src={album.images[0].url} alt="" />
        ) : (
          <img width={"100%"} src="default_album_image.png" alt="" />
        )}
        {album.name}
      </a>
      <div className="overlay">
        <button onClick={() => onLike(album, "album")}>
          {isLiked ? <AiFillHeart /> : <AiOutlineHeart />}
        </button>
        <a href={album.external_urls.spotify} target="_blank" rel="noopener noreferrer">
          <AiOutlineLink />
        </a>
      </div>
    </div>
  );
};

export default AlbumCard;
