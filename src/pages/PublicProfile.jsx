import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import Stars from "../components/Stars";
import LikedGrid from "../components/LikedGrid";
import { BASE_URL } from "../constants";

export default function PublicProfile({ accessToken, onLogout, userProfile }) {
  const { userId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [likedItems, setLikedItems] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const myId = userProfile?.id;

  useEffect(() => {
    const requests = [
      axios.get(`${BASE_URL}/reviews/public/${userId}`),
      axios.get(`${BASE_URL}/bio/${userId}`),
      axios.get(`${BASE_URL}/liked_items?userId=${userId}`),
      axios.get(`${BASE_URL}/follow/counts/${userId}`),
    ];
    if (myId && myId !== userId) {
      requests.push(axios.get(`${BASE_URL}/is-following?followerId=${myId}&followingId=${userId}`));
    }

    Promise.all(requests)
      .then(([reviewsRes, bioRes, likedRes, countsRes, followRes]) => {
        setReviews(reviewsRes.data);
        if (reviewsRes.data.length > 0) setDisplayName(reviewsRes.data[0].display_name || "");
        setBio(bioRes.data.bio || "");
        setLikedItems(likedRes.data.likedItems || []);
        setFollowerCount(countsRes.data.followers);
        if (followRes) setIsFollowing(followRes.data.isFollowing);
      })
      .catch((err) => console.error("Error fetching public profile:", err))
      .finally(() => setLoading(false));
  }, [userId, myId]);

  const handleFollow = async () => {
    if (!myId) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await axios.post(`${BASE_URL}/unfollow`, { followerId: myId, followingId: userId });
        setIsFollowing(false);
        setFollowerCount((c) => c - 1);
      } else {
        await axios.post(`${BASE_URL}/follow`, { followerId: myId, followingId: userId });
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <>
      <Header
        userProfile={userProfile}
        accessToken={accessToken}
        onLogout={onLogout}
      />

      <div className="min-h-screen bg-neutral-900 text-white">
        <div className="h-36 bg-gradient-to-r from-violet-900 to-neutral-800" />

        <div className="max-w-4xl mx-auto px-6">
          <div className="relative -mt-10 mb-8 flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-full border-4 border-neutral-900 bg-violet-700 flex items-center justify-center text-3xl font-bold">
                {displayName.charAt(0) || "?"}
              </div>
              <div className="mb-2">
                <h1 className="text-2xl font-bold text-white">{displayName || "User"}</h1>
                <p className="text-neutral-400 text-sm">
                  <span>{followerCount.toLocaleString()} followers</span>
                  <span className="mx-2">·</span>
                  <span>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                </p>
              </div>
            </div>
            {myId && myId !== userId && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`mb-2 px-5 py-2 rounded-lg text-sm font-semibold transition duration-200 ${
                  isFollowing
                    ? "bg-neutral-700 hover:bg-neutral-600 text-white"
                    : "bg-violet-600 hover:bg-violet-700 text-white"
                } disabled:opacity-40`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {bio && (
            <div className="bg-neutral-800 rounded-xl p-5 mb-8">
              <h2 className="text-violet-400 text-sm font-semibold uppercase tracking-wider mb-2">Bio</h2>
              <p className="text-neutral-300 text-sm">{bio}</p>
            </div>
          )}

          {loading ? (
            <p className="text-neutral-500 text-sm">Loading...</p>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="text-violet-400 text-sm font-semibold uppercase tracking-wider mb-4">Reviews</h2>
                {reviews.length === 0 ? (
                  <p className="text-neutral-500 italic text-sm">No public reviews yet.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-neutral-800 rounded-xl p-4 flex gap-4">
                        {review.album_image && (
                          <img
                            src={review.album_image}
                            alt={review.album_name}
                            className="w-14 h-14 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-white text-sm font-semibold truncate">{review.album_name}</p>
                              <Stars rating={parseFloat(review.rating)} />
                            </div>
                            <p className="text-neutral-600 text-xs flex-shrink-0">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {review.review_text && (
                            <p className="text-neutral-300 text-sm mt-1">{review.review_text}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {likedItems.length > 0 && (
                <div className="pb-16">
                  <LikedGrid likedItems={likedItems} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
