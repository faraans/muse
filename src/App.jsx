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
  const [likedItems, setLikedItems] = useState([]); // Keeps track of liked items
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
      localStorage.setItem("tokenExpiry", Date.now() + 55 * 60 * 1000);
      navigate("/profile", { state: { userProfile, accessToken } });
    }

    if (refreshToken) {
      setRefreshToken(refreshToken);
      localStorage.setItem("refreshToken", refreshToken);
    }

    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    if (storedRefreshToken) {
      setRefreshToken(storedRefreshToken);
    }

    if (storedAccessToken) {
      const isExpired = !tokenExpiry || Date.now() > parseInt(tokenExpiry);
      if (isExpired && storedRefreshToken) {
        axios
          .get(`${BASE_URL}/refresh_token?refresh_token=${storedRefreshToken}`)
          .then((res) => {
            const newToken = res.data.access_token;
            setToken(newToken);
            localStorage.setItem("accessToken", newToken);
            localStorage.setItem("tokenExpiry", Date.now() + 55 * 60 * 1000);
            return fetchUserProfile(newToken);
          })
          .then((profile) => {
            if (profile) {
              setUserProfile(profile);
              fetchLikedItems(profile.id);
            }
          })
          .catch(() => logout());
      } else {
        setToken(storedAccessToken);
        fetchUserProfile(storedAccessToken).then((profile) => {
          if (profile) {
            setUserProfile(profile);
            fetchLikedItems(profile.id);
          }
        });
      }
    }
  }, []);

  const refreshAccessToken = async () => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) return;
    try {
      const res = await axios.get(
        `${BASE_URL}/refresh_token?refresh_token=${storedRefreshToken}`
      );
      const newAccessToken = res.data.access_token;
      setToken(newAccessToken);
      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("tokenExpiry", Date.now() + 55 * 60 * 1000);
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

  const fetchLikedItems = async (userId) => {
    if (!userId) return;
    try {
      const res = await axios.get(`${BASE_URL}/liked_items?userId=${userId}`);
      console.log("Fetched Liked Items:", res.data.likedItems);
      if (res.status === 200) {
        setLikedItems(res.data.likedItems);
      } else {
        console.error("Failed to fetch liked items:", res.data.message);
      }
    } catch (error) {
      console.error("Failed to fetch liked items from DB:", error);
    }
  };

  const logout = () => {
    setToken("");
    setRefreshToken("");
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
    window.localStorage.removeItem("tokenExpiry");
    window.location.reload();
    navigate("/");
  };

  const handleLike = async (item, type) => {
    const isAlreadyLiked = isLiked(item, type);
    const updatedLikedItems = isAlreadyLiked
      ? likedItems.filter(
          (likedItem) =>
            !(likedItem.item_type === type && likedItem.item_id === item.id) // Remove the liked item
        )
      : [...likedItems, { item_type: type, item_id: item.id, name: item.name }]; // Add the liked item

    setLikedItems(updatedLikedItems); // Update the state to trigger re-render

    const endpoint = isAlreadyLiked ? "/unlike" : "/like";
    try {
      await axios.post(`${BASE_URL}${endpoint}`, {
        item: item.id,
        type,
        name: item.name,
        userId: userProfile?.id,
      });
    } catch (error) {
      console.error(
        `Error trying to ${isAlreadyLiked ? "unlike" : "like"} item:`,
        error
      );
    }
  };

  const isLiked = (item, type) => {
    console.log("Checking liked status:", {
      currentItemId: item.id,
      likedItems,
      matches: likedItems.some(
        (likedItem) =>
          likedItem.item_type === type && likedItem.item_id === item.id // Compare item_id with item.id
      ),
    });

    return likedItems.some(
      (likedItem) =>
        likedItem.item_type === type && likedItem.item_id === item.id // Compare item_id with item.id
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
              <h2>Please login to browse</h2>
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
