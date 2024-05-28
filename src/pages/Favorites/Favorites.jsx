import React, { useState } from "react";
import "./Favorites.css";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Search_Dropdown from "../../assets/Search_Dropdown";
import { Tile } from "../../assets/Tile";

export const Favorites = ({ accessToken }) => {
  return (
    <div className="favorite-container">
      <h1 className="">Favorite Albums</h1>
      <div className="card-container">
        {[0, 1, 2, 3].map((index) => (
          <Tile index={index} accessToken={accessToken} />
        ))}
      </div>
    </div>
  );
};