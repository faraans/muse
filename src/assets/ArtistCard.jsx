import React, { useState } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import ArtistDetailModal from "../components/ArtistDetailModal";
import AlbumDetailModal from "../components/AlbumDetailModal";

const ArtistCard = ({ artist, onLike, isLiked, accessToken }) => {
  const [showArtist, setShowArtist] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  return (
    <>
      <div className="artist-display">
        <div className="cursor-pointer" onClick={() => setShowArtist(true)}>
          <div className="relative">
            {artist.images.length ? (
              <img width={"100%"} src={artist.images[0].url} alt="" />
            ) : (
              <img width={"100%"} src="default_artist_image.png" alt="" />
            )}
            <div className="overlay" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => onLike(artist, "artist")}>
                {isLiked ? <AiFillHeart /> : <AiOutlineHeart />}
              </button>
            </div>
          </div>
          {artist.name}
        </div>
      </div>

      {showArtist && (
        <ArtistDetailModal
          artist={artist}
          accessToken={accessToken}
          onClose={() => setShowArtist(false)}
          onAlbumClick={(album) => {
            setShowArtist(false);
            setSelectedAlbum(album);
          }}
        />
      )}
      {selectedAlbum && (
        <AlbumDetailModal
          album={selectedAlbum}
          onClose={() => setSelectedAlbum(null)}
        />
      )}
    </>
  );
};

export default ArtistCard;
