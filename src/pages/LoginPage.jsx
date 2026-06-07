import React from "react";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900">
      <h1 className="main-title text-6xl text-violet-700 mb-4">muse</h1>
      <p className="text-neutral-400 mb-8 text-lg">discover your sound</p>
      <a
        href="http://localhost:8000/login"
        className="bg-green-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-600 transition duration-300"
      >
        Login with Spotify
      </a>
    </div>
  );
}
