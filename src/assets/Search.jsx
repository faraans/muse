import React, { useState } from "react";
import axios from "axios";

const Search = ({ setArtists, setAlbums, setSearchKey, token }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: searchTerm,
          type: "artist,album",
        },
      });
      setArtists(data.artists.items);
      setAlbums(data.albums.items);
    } catch (error) {
      console.error("Error searching artists:", error);
      if (error.response && error.response.status === 401) {
      }
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        className="bg-neutral-900 input"
        placeholder="Search music..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setSearchKey(e.target.value);
        }}
      />
    </form>
  );
};

export default Search;
