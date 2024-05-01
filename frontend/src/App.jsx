import { useState, useEffect } from "react";
import "./index.css";
import axios from "axios";
import { AiOutlineCaretUp, AiOutlineCaretDown } from "react-icons/ai";

const CLIENT_ID = "546d4bb1d257478393b6793e13136215";
const REDIRECT_URI = "http://127.0.0.1:5173/";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";

function App() {
  useEffect(() => {
    fetch("http://127.0.0.1:8000/")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      });
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState("");

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

  const refreshToken = async () => {
    const refreshToken = window.localStorage.getItem("refreshToken");

    if (refreshToken) {
      try {
        const { data } = await axios.post("YOUR_REFRESH_TOKEN_ENDPOINT", {
          refresh_token: refreshToken,
        });
        window.localStorage.setItem("accessToken", data.access_token);
        setToken(data.access_token);
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    }
  };

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
  };

  const [searchKey, setSearchKey] = useState("");
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [state, setState] = useState([]);

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
        refreshToken();
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
          <img
            width={"100%"}
            src="default_artist_image.png"
          /> // Use default image if no image available
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
          <img
            width={"100%"}
            src="default_album_image.png"
          /> // Use default image if no image available
        )}
        {album.name}
      </a>
    ));
  };

  const [buttonText, setButtonText] = useState("muse");
  const [boolean, setBoolean] = useState(true);

  return (
    <>
      <div className="header">
        <div className="bg-neutral-800 py-5 px-5">
          <div className=" text-right h-0">
            {/* {!token ? (
              <a
                href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
              >
                Profile{" "}
              </a>
            ) : (
              <a href="/profile" className="bg-transparent mx-3">
                Profile
              </a>
            )} */}

            {!token ? (
              <a
                href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
              >
                Login to Spotify
              </a>
            ) : (
              <button className="bg-transparent" onClick={logout}>
                Logout
              </button>
            )}
          </div>
          <div className="search-wrapper h-10">
            {token ? (
              <form onSubmit={searchArtists}>
                <input
                  className=" bg-neutral-900 input"
                  placeholder="Search music..."
                  onChange={(e) => setSearchKey(e.target.value)}
                />
              </form>
            ) : (
              <h2>Please login</h2>
            )}
          </div>
        </div>{" "}
      </div>

      <div className="main-page-container my-5">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="main-title border-4 p-4 w-full flex items-center justify-center text-3xl text-violet-700 bg-neutral-800 border-neutral-900"
        >
          {buttonText}

          {!isOpen ? (
            <AiOutlineCaretDown className=""></AiOutlineCaretDown>
          ) : (
            <AiOutlineCaretUp className=""></AiOutlineCaretUp>
          )}
        </button>
        {isOpen && (
          <div className="">
            <button
              onClick={() => {
                setButtonText("artists");
                setBoolean(false);
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
        {state == "artists" && renderArtists()}
        {state == "albums" && renderAlbums()}
        {state == "" && renderAlbums() && renderArtists()}
      </div>
    </>
  );
}

export default App;
