import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"; // Use useNavigate and useLocation here
import axios from "axios";
import { AiOutlineCaretUp, AiOutlineCaretDown } from "react-icons/ai";
import Header from "./pages/Header";
import Search from "./assets/Search";
import ArtistCard from "./assets/ArtistCard";
import AlbumCard from "./assets/AlbumCard";
import Profile from "./pages/Profile";

const CLIENT_ID = "546d4bb1d257478393b6793e13136215";
const REDIRECT_URI = "http://127.0.0.1:5173/";
const BASE_URL = "http://localhost:8000";

function App() {
  const [token, setToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [searchKey, setSearchKey] = useState(""); // Use searchKey here in App
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [state, setState] = useState("");
  const [buttonText, setButtonText] = useState("muse");
  const [isOpen, setIsOpen] = useState(false);
  const [likedItems, setLikedItems] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate(); // Use navigate hook
  const location = useLocation(); // Use location hook

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken) {
      setToken(accessToken);
      localStorage.setItem("accessToken", accessToken);
      navigate("/profile", { state: { userProfile, accessToken } }); // Redirect to profile after login
    }

    if (refreshToken) {
      setRefreshToken(refreshToken);
      localStorage.setItem("refreshToken", refreshToken);
    }

    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (storedAccessToken) {
      setToken(storedAccessToken);
      fetchUserProfile(storedAccessToken).then((profile) => {
        if (profile) setUserProfile(profile);
      });
    }

    if (storedRefreshToken) {
      setRefreshToken(storedRefreshToken);
    }

    fetchLikedItems();
  }, []);

  const refreshAccessToken = async () => {
    if (!refreshToken) return;
    try {
      const res = await axios.get(
        `${BASE_URL}/refresh_token?refresh_token=${refreshToken}`
      );
      const newAccessToken = res.data.access_token;
      setToken(newAccessToken);
      localStorage.setItem("accessToken", newAccessToken);
    } catch (err) {
      console.error("Failed to refresh token:", err);
      logout();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshAccessToken();
    }, 1000 * 60 * 50);

    return () => clearInterval(interval);
  }, [refreshToken]);

  useEffect(() => {
    localStorage.setItem("likedItems", JSON.stringify(likedItems));
  }, [likedItems]);

  const fetchUserProfile = async (accessToken) => {
    try {
      const response = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const fetchLikedItems = () => {
    try {
      const storedLikedItems = localStorage.getItem("likedItems");
      if (storedLikedItems) {
        setLikedItems(JSON.parse(storedLikedItems));
      }
    } catch (error) {
      console.error("Error fetching liked items from local storage:", error);
    }
  };

  const logout = () => {
    setToken("");
    setRefreshToken("");
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
    window.location.reload();
    navigate("/"); // Redirect to home on logout
  };

  const handleLike = (item, type) => {
    const updatedLikedItems = [...likedItems];
    const likedItemIndex = likedItems.findIndex(
      (likedItem) => likedItem.type === type && likedItem.item.id === item.id
    );

    if (likedItemIndex !== -1) {
      updatedLikedItems.splice(likedItemIndex, 1);
    } else {
      updatedLikedItems.push({ type, item });
    }

    setLikedItems(updatedLikedItems);

    const apiUrl = BASE_URL + (likedItemIndex !== -1 ? "/unlike" : "/like");
    axios
      .post(apiUrl, {
        item: item.id,
        type,
        name: item.name,
        userId: userProfile?.id,
      })
      .catch((error) => {
        console.error("Error updating liked items:", error);
      });
  };

  const isLiked = (item, type) => {
    return likedItems.some(
      (likedItem) => likedItem.type === type && likedItem.item.id === item.id
    );
  };

  const renderArtists = () =>
    artists.map((artist) => (
      <ArtistCard
        key={artist.id}
        artist={artist}
        onLike={handleLike}
        isLiked={isLiked(artist, "artist")}
      />
    ));

  const renderAlbums = () =>
    albums.map((album) => (
      <AlbumCard
        key={album.id}
        album={album}
        onLike={handleLike}
        isLiked={isLiked(album, "album")}
      />
    ));

  const HomePage = () => (
    <>
      {location.pathname !== "/login" && (
        <Header
          userProfile={userProfile}
          accessToken={token}
          onLogout={logout}
          token={token}
        />
      )}
      <div className="main-page-container my-5">
        {location.pathname !== "/login" && (
          <div className="search-wrapper h-10">
            {token ? (
              <Search
                setArtists={setArtists}
                setAlbums={setAlbums}
                setSearchKey={setSearchKey}
                token={token}
                searchKey={searchKey}
              />
            ) : (
              <h2>Please login</h2>
            )}
          </div>
        )}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="main-title my-3 p-4 w-full flex items-center justify-center text-3xl text-violet-700 bg-neutral-800 border-neutral-900"
        >
          {buttonText}
          {!isOpen ? <AiOutlineCaretDown /> : <AiOutlineCaretUp />}
        </button>
        {isOpen && (
          <div>
            <button
              onClick={() => {
                setButtonText("artists");
                setState("artists");
              }}
              className="hover:bg-neutral-700 transition main-title p-4 w-full flex items-center justify-center text-3xl text-violet-700 bg-neutral-800 border-neutral-900"
            >
              artists
            </button>
            <div className="py-2"></div>
            <button
              onClick={() => {
                setButtonText("albums");
                setState("albums");
              }}
              className="hover:bg-neutral-700 transition main-title p-4 w-full flex items-center justify-center text-3xl text-violet-700 bg-neutral-800 border-neutral-900"
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

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/profile"
        element={<Profile accessToken={token} userProfile={userProfile} />}
      />
    </Routes>
  );
}

export default App;
