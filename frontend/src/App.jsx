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
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }

    setToken(token);
  }, []);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  const [searchKey, setSearchKey] = useState("");
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);

  const searchArtists = async (e) => {
    e.preventDefault();
    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: searchKey,
        type: "artist",
      },
    });

    setArtists(data.artists.items);
  };

  const searchAlbums = async (e) => {
    e.preventDefault();
    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: searchKey,
        type: "album",
      },
    });

    setAlbums(data.albums.items);
  };

  const renderArtists = () => {
    return artists.map((artist) => (
      <div className="artist-display" key={artist.id}>
        {artist.images.length ? (
          <img width={"100%"} src={artist.images[0].url} alt="" />
        ) : (
          <div>No Image</div>
        )}
        {artist.name}
      </div>
    ));
  };

  const renderAlbums = () => {
    return albums.map((album) => (
      <div className="artist-display" key={album.id}>
        {album.images.length ? (
          <img width={"100%"} src={album.images[0].url} alt="" />
        ) : (
          <div>No Image</div>
        )}
        {album.name}
      </div>
    ));
  };

  return (
    <>
      <div className="header">
        <div className="bg-neutral-800 py-5 px-5">
          <div className=" text-right h-0">
            {!token ? (
              <a
                href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
              >
                Profile{" "}
              </a>
            ) : (
              <a href="/profile" className="bg-transparent mx-3">
                Profile
              </a>
            )}

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
          muse
          {!isOpen ? (
            <AiOutlineCaretDown className=""></AiOutlineCaretDown>
          ) : (
            <AiOutlineCaretUp className=""></AiOutlineCaretUp>
          )}
        </button>
        {isOpen && (
          <div className="">
            <button className="hover:bg-neutral-700 transition main-title border-4 p-4 w-full flex items-center justify-center text-3xl text-violet-700  bg-neutral-800 border-neutral-900">
              artists
            </button>
            <button className="hover:bg-neutral-700 transition main-title border-4 p-4 w-full flex items-center justify-center text-3xl text-violet-700  bg-neutral-800 border-neutral-900">
              albums
            </button>
          </div>
        )}
        <p className="my-5"></p>
        {renderArtists()}
      </div>
    </>
  );
}

export default App;
