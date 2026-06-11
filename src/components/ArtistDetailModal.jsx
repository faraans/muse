import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiOutlineLink } from "react-icons/ai";
import useEscapeKey from "../hooks/useEscapeKey";

export default function ArtistDetailModal({ artist, accessToken, onClose, onAlbumClick }) {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("album");

  useEscapeKey(onClose);

  useEffect(() => {
    axios
      .get(`https://api.spotify.com/v1/artists/${artist.id}/albums`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { include_groups: "album,single", limit: 50, market: "US" },
      })
      .then((res) => setReleases(res.data.items))
      .catch((err) => console.error("Error fetching artist releases:", err))
      .finally(() => setLoading(false));
  }, [artist.id, accessToken]);

  const filtered = releases.filter((r) => r.album_type === filter);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-neutral-800 rounded-xl w-full max-w-lg mx-4 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Artist header */}
        <div className="p-6 flex items-center gap-4 flex-shrink-0">
          {artist.images?.[0]?.url && (
            <img
              src={artist.images[0].url}
              alt={artist.name}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-xl">{artist.name}</h2>
            {artist.followers?.total && (
              <p className="text-neutral-400 text-sm">
                {artist.followers.total.toLocaleString()} followers on Spotify
              </p>
            )}
            <a
              href={artist.external_urls?.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm mt-1 transition duration-200"
            >
              <AiOutlineLink /> Open in Spotify
            </a>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-6 flex gap-4 flex-shrink-0">
          {["album", "single"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`text-sm pb-2 border-b-2 transition duration-200 capitalize ${
                filter === type
                  ? "border-violet-400 text-white"
                  : "border-transparent text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {type}s
            </button>
          ))}
        </div>

        <hr className="border-neutral-700" />

        {/* Releases grid */}
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <p className="text-neutral-500 text-sm">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-neutral-500 italic text-sm">No {filter}s found.</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filtered.map((release) => (
                <div
                  key={release.id}
                  className="flex flex-col gap-1 cursor-pointer group"
                  onClick={() => onAlbumClick(release)}
                >
                  <div className="relative aspect-square overflow-hidden rounded">
                    <img
                      src={release.images?.[0]?.url}
                      alt={release.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                  </div>
                  <p className="text-white text-xs font-medium leading-tight line-clamp-2">
                    {release.name}
                  </p>
                  <p className="text-neutral-500 text-xs">
                    {release.release_date?.slice(0, 4)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
