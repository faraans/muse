import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "./constants";
import { AiOutlineCaretUp, AiOutlineCaretDown } from "react-icons/ai";
import Header from "./pages/Header";
import Search from "./assets/Search";
import ArtistCard from "./assets/ArtistCard";
import AlbumCard from "./assets/AlbumCard";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import LoginPage from "./pages/LoginPage";

function App() {
  const [token, setToken] = useState(localStorage.getItem("accessToken") || "");
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken") || "");
  const [results, setResults] = useState([]);
  const [state, setState] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [likedItems, setLikedItems] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
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
              Promise.all([fetchLikedItems(profile.id), fetchUserReviews(profile.id)]);
            }
          })
          .catch(() => logout());
      } else {
        setToken(storedAccessToken);
        fetchUserProfile(storedAccessToken).then((profile) => {
          if (profile) {
            setUserProfile(profile);
            Promise.all([fetchLikedItems(profile.id), fetchUserReviews(profile.id)]);
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
  }, []);

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
      setLikedItems(res.data.likedItems);
    } catch (error) {
      console.error("Failed to fetch liked items from DB:", error);
    }
  };

  const fetchUserReviews = async (userId) => {
    if (!userId) return;
    try {
      const res = await axios.get(`${BASE_URL}/reviews/user/${userId}`);
      setUserReviews(res.data);
    } catch (error) {
      console.error("Failed to fetch user reviews:", error);
    }
  };

  const logout = () => {
    setToken("");
    setRefreshToken("");
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
    window.localStorage.removeItem("tokenExpiry");
    window.location.reload();
  };

  const handleLike = async (item, type) => {
    const isAlreadyLiked = isLiked(item, type);
    const updatedLikedItems = isAlreadyLiked
      ? likedItems.filter((li) => !(li.item_type === type && li.item_id === item.id))
      : [...likedItems, { item_type: type, item_id: item.id, name: item.name, image_url: item.images?.[0]?.url || null }];

    setLikedItems(updatedLikedItems);

    const endpoint = isAlreadyLiked ? "/unlike" : "/like";
    try {
      await axios.post(`${BASE_URL}${endpoint}`, {
        item: item.id,
        type,
        name: item.name,
        userId: userProfile?.id,
        imageUrl: item.images?.[0]?.url || null,
      });
    } catch (error) {
      console.error(
        `Error trying to ${isAlreadyLiked ? "unlike" : "like"} item:`,
        error
      );
    }
  };

  const isLiked = (item, type) =>
    likedItems.some((li) => li.item_type === type && li.item_id === item.id);

  const userReviewMap = useMemo(
    () => new Map(userReviews.map((r) => [r.album_id, r])),
    [userReviews]
  );

  const renderResults = (items) =>
    items.map((item) =>
      item.type === "artist" ? (
        <ArtistCard
          key={item.id}
          artist={item}
          onLike={handleLike}
          isLiked={isLiked(item, "artist")}
          accessToken={token}
        />
      ) : (
        <AlbumCard
          key={item.id}
          album={item}
          onLike={handleLike}
          isLiked={isLiked(item, "album")}
          userId={userProfile?.id}
          displayName={userProfile?.display_name}
          userReview={userReviewMap.get(item.id) ?? null}
          onReviewSaved={() => fetchUserReviews(userProfile?.id)}
        />
      )
    );

  const HomePage = () => {
    if (!token) return <LoginPage />;

    return (
    <>
      <Header
        userProfile={userProfile}
        accessToken={token}
        onLogout={logout}
      />
      <div className="main-page-container my-5">
        <div className="search-wrapper h-10">
          <Search
            setResults={setResults}
            token={token}
          />
        </div>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="main-title my-3 p-4 w-full flex items-center justify-center text-3xl text-violet-700 bg-neutral-800 border-neutral-900"
        >
          {state || "muse"}
          {!isOpen ? <AiOutlineCaretDown /> : <AiOutlineCaretUp />}
        </button>
        {isOpen && (
          <div>
            <button
              onClick={() => {
                setState(state === "artists" ? "" : "artists");
              }}
              className={`hover:bg-neutral-700 transition main-title p-4 w-full flex items-center justify-center text-3xl bg-neutral-800 border-neutral-900 ${state === "artists" ? "text-white" : "text-violet-700"}`}
            >
              artists
            </button>
            <div className="py-2"></div>
            <button
              onClick={() => {
                setState(state === "albums" ? "" : "albums");
              }}
              className={`hover:bg-neutral-700 transition main-title p-4 w-full flex items-center justify-center text-3xl bg-neutral-800 border-neutral-900 ${state === "albums" ? "text-white" : "text-violet-700"}`}
            >
              albums
            </button>
          </div>
        )}
        <p className="my-5"></p>
        {state === "artists" || state === "albums"
          ? renderResults(results.filter((r) => r.type === { artists: "artist", albums: "album" }[state]))
          : renderResults(results)}
      </div>
    </>
    );
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/profile"
        element={<Profile accessToken={token} userProfile={userProfile} likedItems={likedItems} onLogout={logout} />}
      />
      <Route
        path="/user/:userId"
        element={<PublicProfile accessToken={token} userProfile={userProfile} onLogout={logout} />}
      />
    </Routes>
  );
}

export default App;
