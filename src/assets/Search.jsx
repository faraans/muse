import React, { useState } from "react";
import axios from "axios";

const Search = ({ setArtists, setAlbums, token }) => {
  const [searchTerm, setSearchTerm] = useState(""); // Local state for search term

  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent form submission from refreshing the page

    if (!searchTerm.trim()) return; // Avoid search if input is empty

    try {
      const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: searchTerm,
          type: "artist,album",
        },
      });

      // Set the results if data is received
      setArtists(response.data.artists.items);
      setAlbums(response.data.albums.items);
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}> {/* Handle form submission */}
        <input
          className="bg-neutral-900 input"
          placeholder="Search music..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Update the search term on change
        />
      </form>
    </div>
  );
};

export default Search;
