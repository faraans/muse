import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import { Favorites } from "./Favorites/Favorites";

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve access token from location or localStorage
  const initialToken =
    location.state?.accessToken || localStorage.getItem("accessToken");

  const [accessToken, setAccessToken] = useState(initialToken || "");
  const [displayName, setDisplayName] = useState("");
  const [userId, setUserId] = useState("");

  // Persist access token to localStorage
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }
  }, [accessToken]);

  // Fetch user profile using token
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const profile = response.data;
        setDisplayName(profile.display_name || "No Display Name");
        setUserId(profile.id);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        navigate("/");
      }
    };

    if (accessToken && !userId) {
      fetchUserProfile();
    }
  }, [accessToken, userId, navigate]);

  const logout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/";
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
      <section className="py-5 hero">
        <div className="container">
          <div className="content">
            <div className="hero-main">
              <div className="hero-text">
                <h1>{displayName}'s Profile</h1>
                <p>User ID: {userId}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <h2>
          <Favorites accessToken={accessToken} userProfile={{ id: userId }} />
        </h2>
      </section>
    </>
  );
};

export default Profile;