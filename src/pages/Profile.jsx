import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import { Favorites } from "./Favorites/Favorites";
import LikedGrid from "../components/LikedGrid";
import UserReviews from "../components/UserReviews";

const BASE_URL = "http://localhost:8000";

const Profile = ({ likedItems = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialToken =
    location.state?.accessToken || localStorage.getItem("accessToken");

  const [accessToken, setAccessToken] = useState(initialToken || "");
  const [displayName, setDisplayName] = useState("");
  const [userId, setUserId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [followers, setFollowers] = useState(null);
  const [bio, setBio] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState("");

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }
  }, [accessToken]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("https://api.spotify.com/v1/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const profile = response.data;
        setDisplayName(profile.display_name || "No Display Name");
        setUserId(profile.id);
        setFollowers(profile.followers?.total ?? null);
        if (profile.images?.length > 0) {
          setAvatarUrl(profile.images[0].url);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        navigate("/");
      }
    };

    if (accessToken && !userId) {
      fetchUserProfile();
    }
  }, [accessToken, userId, navigate]);

  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${BASE_URL}/bio/${userId}`)
      .then((res) => setBio(res.data.bio))
      .catch((err) => console.error("Error fetching bio:", err));
  }, [userId]);

  const logout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/";
  };

  const startEditingBio = () => {
    setBioInput(bio);
    setEditingBio(true);
  };

  const saveBio = async () => {
    try {
      await axios.post(`${BASE_URL}/bio`, { userId, bio: bioInput });
      setBio(bioInput);
      setEditingBio(false);
    } catch (err) {
      console.error("Error saving bio:", err);
    }
  };

  if (!accessToken) {
    return (
      <div className="text-center mt-10 text-red-500">
        <p>
          Access token missing. Please{" "}
          <a className="text-blue-600 underline" href="/">
            log in
          </a>{" "}
          again.
        </p>
      </div>
    );
  }

  return (
    <>
      <Header
        userProfile={{ display_name: displayName }}
        accessToken={accessToken}
        onLogout={logout}
      />

      <div className="min-h-screen bg-neutral-900 text-white">
        {/* Banner */}
        <div className="h-36 bg-gradient-to-r from-violet-900 to-neutral-800" />

        {/* Profile card */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative -mt-16 mb-6 flex items-end gap-5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-28 h-28 rounded-full border-4 border-neutral-900 object-cover"
              />
            ) : (
              <div className="w-28 h-28 rounded-full border-4 border-neutral-900 bg-violet-700 flex items-center justify-center text-4xl font-bold">
                {displayName.charAt(0)}
              </div>
            )}
            <div className="mb-2">
              <h1 className="text-3xl font-bold main-title text-white">
                {displayName}
              </h1>
              {followers !== null && (
                <p className="text-neutral-400 text-sm">
                  {followers.toLocaleString()} followers on Spotify
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="bg-neutral-800 rounded-xl p-5 mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-violet-400 text-sm font-semibold uppercase tracking-wider">
                Bio
              </h2>
              {!editingBio && (
                <button
                  onClick={startEditingBio}
                  className="text-neutral-400 hover:text-white text-xs transition duration-200"
                >
                  {bio ? "Edit" : "+ Add bio"}
                </button>
              )}
            </div>

            {editingBio ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  rows={3}
                  placeholder="Write something about yourself..."
                  className="w-full bg-neutral-700 text-white rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setEditingBio(false)}
                    className="text-neutral-400 hover:text-white text-sm transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveBio}
                    className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-1 rounded-lg transition duration-200"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-neutral-300 text-sm">
                {bio || (
                  <span className="text-neutral-500 italic">No bio yet.</span>
                )}
              </p>
            )}
          </div>

          {/* Favorites */}
          <h2 className="text-violet-400 text-sm font-semibold uppercase tracking-wider mb-4">
            Favorites
          </h2>
          <Favorites accessToken={accessToken} userProfile={{ id: userId }} />

          {/* Reviews */}
          <div className="mt-10">
            <h2 className="text-violet-400 text-sm font-semibold uppercase tracking-wider mb-4">
              Reviews
            </h2>
            <UserReviews userId={userId} displayName={displayName} />
          </div>

          {/* Liked Artists & Albums */}
          <div className="mt-10 pb-16">
            <LikedGrid likedItems={likedItems} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
