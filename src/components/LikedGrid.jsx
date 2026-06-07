import React, { useState } from "react";

export default function LikedGrid({ likedItems }) {
  const [tab, setTab] = useState("artists");

  const artists = likedItems.filter((i) => i.item_type === "artist");
  const albums = likedItems.filter((i) => i.item_type === "album");
  const items = tab === "artists" ? artists : albums;

  return (
    <div className="mb-10">
      {/* Tabs */}
      <div className="flex items-center gap-6 mb-4">
        <h2 className="text-violet-400 text-sm font-semibold uppercase tracking-wider">
          Liked
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setTab("artists")}
            className={`text-sm transition duration-200 ${
              tab === "artists"
                ? "text-white font-semibold"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Artists
          </button>
          <button
            onClick={() => setTab("albums")}
            className={`text-sm transition duration-200 ${
              tab === "albums"
                ? "text-white font-semibold"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Albums
          </button>
        </div>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <p className="text-neutral-500 italic text-sm">
          No liked {tab} yet.
        </p>
      ) : (
        <div className="grid grid-cols-6 gap-2">
          {items.map((item) => (
            <div key={item.item_id} className="group relative aspect-square">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full rounded bg-neutral-700 flex items-center justify-center text-neutral-500 text-xs">
                  ?
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-200 rounded flex items-end p-1">
                <span className="text-white text-xs leading-tight line-clamp-2">
                  {item.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
