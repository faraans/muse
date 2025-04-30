import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ accessToken, onLogout, userProfile }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile", { state: { userProfile } });
  };

  return (
    <div className="header">
      <div className="bg-neutral-800 py-5 px-5 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl mr-8 main-title text-violet-700">muse</h1>
          <nav className="space-x-4">
            <Link
              to="/"
              className="text-white hover:text-gray-300 transition duration-300"
            >
              Home
            </Link>
            {accessToken && (
              <span
                onClick={handleProfileClick}
                className="cursor-pointer text-white hover:text-gray-300 transition duration-300"
              >
                Profile
              </span>
            )}
          </nav>
        </div>
        <div>
          {!accessToken ? (
            <a
              href="http://localhost:8000/login"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
            >
              Login with Spotify
            </a>
          ) : (
            <button
              onClick={onLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
