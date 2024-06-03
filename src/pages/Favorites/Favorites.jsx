import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Favorites.css";
import { Tile } from "../../assets/Tile";

export const Favorites = ({ userProfile, accessToken }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/favorites/${userProfile.id}`
        );
        setFavorites(response.data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    if (userProfile.id) {
      fetchFavorites();
    }
  }, [userProfile.id]);

  return (
    <div className="favorite-container">
      <h1>Favorite Albums</h1>
      <div className="card-container">
        {Array.from({ length: 4 }).map((_, index) => {
          const album = favorites[index] || {};
          return (
            <Tile
              key={index}
              album={album}
              accessToken={accessToken}
              userId={userProfile.id}
              setFavorites={setFavorites}
              index={index}
              userProfile={userProfile}
            />
          );
        })}
      </div>
    </div>
  );
};
