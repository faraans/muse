import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import { Favorites } from "./Favorites/Favorites";

const Profile = ({ accessToken }) => {
  const location = useLocation();
  const userProfile = location.state?.userProfile || {};
  const [displayName, setDisplayName] = useState(
    userProfile.display_name || "No Display Name"
  );
  const [userId, setUserId] = useState(userProfile.id || "");

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
      }
    };

    if (accessToken && !userProfile.id) {
      fetchUserProfile();
    }
  }, [accessToken, userProfile.id]);

  const logout = () => {
    window.localStorage.removeItem("accessToken");
    window.location.href = "/";
  };

  return (
    <>
      <Header
        userProfile={userProfile}
        accessToken={accessToken}
        onLogout={logout}
      />
      <section className="hero">
        <div className="container">
          <div className="content">
            <div className="hero-main">
              <div className="hero-text">
                <h1>{displayName}'s Profile</h1>
                <p>
                  User ID: {userId}
                  <br />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <h2>
          <Favorites accessToken={accessToken} userProfile={userProfile} />
        </h2>
      </section>
    </>
  );
};

export default Profile;
