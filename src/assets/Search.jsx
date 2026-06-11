import React, { useState } from "react";
import axios from "axios";

const Search = ({ setResults, token }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: searchTerm, type: "artist,album", limit: 20 },
      });

      const artists = response.data.artists.items.map((a) => ({ ...a, type: "artist" }));
      const albums = response.data.albums.items.map((a) => ({ ...a, type: "album" }));
      const merged = [];
      const max = Math.max(artists.length, albums.length);
      for (let i = 0; i < max; i++) {
        if (artists[i]) merged.push(artists[i]);
        if (albums[i]) merged.push(albums[i]);
      }
      setResults(merged);
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
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>
    </div>
  );
};

export default Search;
