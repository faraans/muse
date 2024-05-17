import React, { useState, useEffect } from "react";
import axios from "axios";
import { AiOutlineCaretUp, AiOutlineCaretDown } from "react-icons/ai";
import { useLocation } from "react-router-dom";
import Header from "./pages/Header";

const CLIENT_ID = "546d4bb1d257478393b6793e13136215";
const REDIRECT_URI =
  "http://127.0.0.1:5173/" || "https://muse-react-app.netlify.app/";
const RESPONSE_TYPE = "token";

function App() {
  const [token, setToken] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [state, setState] = useState("");
  const [buttonText, setButtonText] = useState("muse");
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash;
    let accessToken = window.localStorage.getItem("accessToken");
    const refreshToken = window.localStorage.getItem("refreshToken");

    if (!accessToken && hash) {
      const accessTokenParam = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"));

      if (accessTokenParam) {
        accessToken = accessTokenParam.split("=")[1];

        const refreshTokenParam = hash
          .substring(1)
          .split("&")
          .find((elem) => elem.startsWith("refresh_token"));

        const newRefreshToken = refreshTokenParam
          ? refreshTokenParam.split("=")[1]
          : null;

        window.location.hash = "";
        window.localStorage.setItem("accessToken", accessToken);
        if (newRefreshToken) {
          window.localStorage.setItem("refreshToken", newRefreshToken);
        }
      }
    }

    if (accessToken) {
      setToken(accessToken);
    }
  }, []);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
    window.location.href = "/";
  };

  const searchArtists = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: searchKey,
          type: "artist,album",
        },
      });
      setArtists(data.artists.items);
      setAlbums(data.albums.items);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Handle unauthorized access here
      } else {
        console.error("Error searching artists:", error);
      }
    }
  };

  const renderArtists = () => {
    return artists.map((artist) => (
      <a
        href={artist.external_urls.spotify}
        className="artist-display"
        key={artist.id}
        target="_blank"
        rel="noopener noreferrer"
      >
        {artist.images.length ? (
          <img width={"100%"} src={artist.images[0].url} alt="" />
        ) : (
          <img width={"100%"} src="default_artist_image.png" alt="" />
        )}
        {artist.name}
      </a>
    ));
  };

  const renderAlbums = () => {
    return albums.map((album) => (
      <a
        href={album.external_urls.spotify}
        className="artist-display"
        key={album.id}
        target="_blank"
        rel="noopener noreferrer"
      >
        {album.images.length ? (
          <img width={"100%"} src={album.images[0].url} alt="" />
        ) : (
          <img width={"100%"} src="default_album_image.png" alt="" />
        )}
        {album.name}
      </a>
    ));
  };

  return (
    <>
      {location.pathname !== "/login" && (
        <Header accessToken={token} onLogout={logout} />
      )}
      <div className="main-page-container my-5">
        {location.pathname !== "/login" && (
          <div className="search-wrapper h-10">
            {token ? (
              <form onSubmit={searchArtists}>
                <input
                  className="bg-neutral-900 input"
                  placeholder="Search music..."
                  onChange={(e) => setSearchKey(e.target.value)}
                />
              </form>
            ) : (
              <h2>Please login</h2>
            )}
          </div>
        )}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="main-title border-4 p-4 w-full flex items-center justify-center text-3xl text-violet-700 bg-neutral-800 border-neutral-900"
        >
          {buttonText}
          {!isOpen ? (
            <AiOutlineCaretDown className="" />
          ) : (
            <AiOutlineCaretUp className="" />
          )}
        </button>
        {isOpen && (
          <div className="">
            <button
              onClick={() => {
                setButtonText("artists");
                setState("artists");
              }}
              className="hover:bg-neutral-700 transition main-title border-4 p-4 w-full flex items-center justify-center text-3xl text-violet-700  bg-neutral-800 border-neutral-900"
            >
              artists
            </button>
            <button
              onClick={() => {
                setButtonText("albums");
                setState("albums");
              }}
              className="hover:bg-neutral-700 transition main-title border-4 p-4 w-full flex items-center justify-center text-3xl text-violet-700  bg-neutral-800 border-neutral-900"
            >
              albums
            </button>
          </div>
        )}
        <p className="my-5"></p>
        {state === "artists" || state === "albums" ? (
          <>
            {state === "artists" && renderArtists()}
            {state === "albums" && renderAlbums()}
          </>
        ) : (
          <>
            {renderArtists()}
            {renderAlbums()}
          </>
        )}
      </div>
    </>
  );
}

export default App;
