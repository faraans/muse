import React, { useState, useEffect } from "react";
import axios from "axios";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Search_Dropdown from "./Search_Dropdown";

export const Tile = ({
  album,
  accessToken,
  userId,
  setFavorites,
  index,
  userProfile,
}) => {
  const [image, setImage] = useState(album.album_image || null);
  const [showDropDownIndex, setShowDropDownIndex] = useState(null);
  const [albumData, setAlbumData] = useState(album);

  useEffect(() => {
    setAlbumData(album);
    setImage(album.album_image || null);
  }, [album]);

  const handleButtonClick = (index) => {
    if (!albumData.album_id) {
      setShowDropDownIndex(showDropDownIndex === index ? null : index);
    }
  };

  const handleFavorite = async (albumDetails) => {
    try {
      const newAlbum = {
        user_id: userProfile.id,
        album_id: albumDetails.id,
        album_name: albumDetails.name,
        album_image: albumDetails.image,
        album_url: albumDetails.url,
        position: index,
      };
      const response = await axios.post(
        "http://localhost:8000/favorite",
        newAlbum
      );
      setFavorites((prevFavorites) => {
        const updatedFavorites = [...prevFavorites];
        updatedFavorites[index] = newAlbum;
        return updatedFavorites;
      });
      setAlbumData(newAlbum);
      setImage(newAlbum.album_image);
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  };

  const handleUnfavorite = async () => {
    try {
      await axios.post("http://localhost:8000/unfavorite", {
        user_id: userProfile.id,
        album_id: albumData.album_id,
      });
      setFavorites((prevFavorites) => {
        const updatedFavorites = [...prevFavorites];
        updatedFavorites[index] = {};
        return updatedFavorites;
      });
      setAlbumData({});
      setImage(null);
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  return (
    <div key={albumData.album_id || index} className="tile">
      <button
        onClick={() => handleButtonClick(index)}
        className={`card${albumData.album_id ? " favorited" : ""}`}
      >
        {image ? (
          <img
            className="image"
            src={image}
            alt={albumData.album_name || "Album"}
          />
        ) : (
          <AddCircleOutlineIcon />
        )}
      </button>
      {showDropDownIndex === index && !albumData.album_id && (
        <Search_Dropdown
          accessToken={accessToken}
          setImage={setImage}
          handleFavorite={handleFavorite}
        />
      )}
      {albumData.album_name && (
        <div className="tile-details">
          <h3>{albumData.album_name}</h3>
          {albumData.album_id && (
            <button onClick={handleUnfavorite} className="unfavorite-button">
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Tile;
