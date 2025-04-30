import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import { Favorites } from "./Favorites/Favorites";

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch the userProfile and accessToken from location.state or localStorage
  const locationUserProfile = location.state?.userProfile || {};
  const locationToken = location.state?.accessToken || localStorage.getItem("accessToken");

  const [displayName, setDisplayName] = useState(
    locationUserProfile.display_name || "No Display Name"
  );
  const [userId, setUserId] = useState(locationUserProfile.id || "");
  const [accessToken, setAccessToken] = useState(locationToken);

  useEffect(() => {
    // If we have accessToken, fetch user profile if userId is missing
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
        // If there's an error fetching the profile, redirect to home page
        navigate("/");
      }
    };

    // Fetch user profile only if no userId is found
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
      <div>
        <p>You must log in to view the profile.</p>
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
      <section className="hero">
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
