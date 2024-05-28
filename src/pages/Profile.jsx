import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";
import { Favorites } from "./Favorites/Favorites";

const Profile = ({ accessToken }) => {
  console.log(accessToken);
  const [displayName, setDisplayName] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log(response.data);
        setDisplayName(response.data.display_name || "No Display Name");
        setUserId(response.data.id);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    if (accessToken) {
      fetchUserProfile();
    }
  }, [accessToken]);

  const logout = () => {
    // Clear the access token from local storage
    window.localStorage.removeItem("accessToken");
    window.location.href = "/";
  };

  return (
    <>
      <Header accessToken={accessToken} onLogout={logout} />
      {/* Pass accessToken to Header */}
      <section className="hero">
        <div className="container">
          <div className="content">
            <div className="hero-main">
              <div className="hero-text">
                <h1>{displayName}'s Profile</h1>
                <p>
                  User ID: {userId}
                  <br />
                  {/* Your other profile content here */}
                </p>
                {}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <h2>
          <Favorites accessToken={accessToken} />
        </h2>
      </section>
    </>
  );
};

export default Profile;
