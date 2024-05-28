import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import {
  CLIENT_ID,
  REDIRECT_URI,
  AUTH_ENDPOINT,
  RESPONSE_TYPE,
} from "../constants";

const Search_Dropdown = ({ accessToken, setImage }) => {
  const [token, setToken] = useState(accessToken);
  const [searchKey, setSearchKey] = useState("");
  const [albums, setAlbums] = useState([]);
  const [value, setValue] = useState(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      if (searchKey) {
        try {
          const { data } = await axios.get(
            "https://api.spotify.com/v1/search",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: {
                q: searchKey,
                type: "album",
              },
            }
          );
          console.log(data.albums);
          setAlbums(data.albums.items);
        } catch (error) {
          console.error("Error fetching albums:", error);
        }
      } else {
        setAlbums([]);
      }
    };

    fetchAlbums();
  }, [searchKey, token]);

  return (
    <div className="main">
      <div className="search">
        <Autocomplete
          options={albums}
          getOptionLabel={(option) => option.name}
          value={value}
          onChange={(event, newValue) => {
            setImage(newValue.images[0].url);
            setValue(newValue);
          }}
          inputValue={searchKey}
          onInputChange={(event, newInputValue) => {
            setSearchKey(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Albums"
              variant="outlined"
              fullWidth
            />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              {option.name} by{" "}
              {option.artists.map((artist) => artist.name).join(", ")}
            </li>
          )}
        />
      </div>
    </div>
  );
};

export default Search_Dropdown;
