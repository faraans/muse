require("dotenv").config();
const express = require("express");
const app = express();
const mysql = require("mysql2");
const axios = require("axios");
const cors = require("cors");
const querystring = require("querystring");
const port = 8000;

app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "muse-db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const promisePool = db.promise();

promisePool
  .query("SELECT 1")
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection error", err));

Promise.all([
  promisePool
    .query("CREATE TABLE IF NOT EXISTS `user_bios` (`user_id` VARCHAR(255) PRIMARY KEY, `bio` TEXT)")
    .catch((err) => console.error("Error creating user_bios table:", err)),
  promisePool.query(`
    CREATE TABLE IF NOT EXISTS \`reviews\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`user_id\` VARCHAR(255) NOT NULL,
      \`display_name\` VARCHAR(255),
      \`album_id\` VARCHAR(255) NOT NULL,
      \`album_name\` VARCHAR(500),
      \`album_image\` VARCHAR(500),
      \`rating\` DECIMAL(2,1) NOT NULL,
      \`review_text\` TEXT,
      \`is_private\` BOOLEAN NOT NULL DEFAULT FALSE,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY \`unique_user_album\` (\`user_id\`, \`album_id\`)
    )
  `).catch((err) => console.error("Error creating reviews table:", err)),
  promisePool.query(`
    CREATE TABLE IF NOT EXISTS \`follows\` (
      \`follower_id\` VARCHAR(255) NOT NULL,
      \`following_id\` VARCHAR(255) NOT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`follower_id\`, \`following_id\`)
    )
  `).catch((err) => console.error("Error creating follows table:", err)),
  promisePool
    .query("ALTER TABLE `reviews` ADD COLUMN `display_name` VARCHAR(255) AFTER `user_id`")
    .catch((err) => { if (err.code !== "ER_DUP_FIELDNAME") console.error("Error adding display_name column:", err); }),
  promisePool
    .query("ALTER TABLE `liked_items` ADD COLUMN `image_url` VARCHAR(500)")
    .catch((err) => { if (err.code !== "ER_DUP_FIELDNAME") console.error("Error adding image_url column:", err); }),
]);

// Endpoint for liking an item
app.post("/like", async (req, res) => {
  const { item, type, name, userId, imageUrl } = req.body;

  if (!item || !type || !name || !userId) {
    return res.status(400).send("Missing required fields");
  }

  const sql =
    "INSERT IGNORE INTO `liked_items` (`item_id`, `item_type`, `name`, `user_id`, `image_url`) VALUES (?, ?, ?, ?, ?)";
  try {
    await promisePool.query(sql, [item, type, name, userId, imageUrl || null]);
    res.status(200).send("Item liked successfully");
  } catch (err) {
    // Log the SQL error message
    console.error("Error liking item:", err);
    res
      .status(500)
      .send({ error: "Internal Server Error", message: err.message });
  }
});

// Endpoint for unliking an item
app.post("/unlike", async (req, res) => {
  const { item, userId } = req.body;


  if (!item || !userId) {
    return res.status(400).send("Missing required fields");
  }

  const sql = "DELETE FROM liked_items WHERE item_id = ? AND user_id = ?";
  try {
    await promisePool.query(sql, [item, userId]);
    res.status(200).send("Item unliked successfully");
  } catch (err) {
    console.error("Error unliking item:", err);
    res
      .status(500)
      .send({ error: "Internal Server Error", message: err.message });
  }
});

// Endpoint for favoriting an album
app.post("/favorite", async (req, res) => {
  const { user_id, album_id, album_name, album_image, album_url } = req.body;


  if (!user_id || !album_id || !album_name || !album_image || !album_url) {
    return res.status(400).send("Missing required fields");
  }

  const sql =
    "INSERT INTO `favorites` (`user_id`, `album_id`, `album_name`, `album_image`, `album_url`) VALUES (?, ?, ?, ?, ?)";
  try {
    await promisePool.query(sql, [
      user_id,
      album_id,
      album_name,
      album_image,
      album_url,
    ]);
    res.status(200).send("Album added to favorites successfully");
  } catch (err) {
    console.error("Error adding to favorites:", err);
    res
      .status(500)
      .send({ error: "Internal Server Error", message: err.message });
  }
});

// Endpoint for unfavoriting an album
app.post("/unfavorite", async (req, res) => {
  const { user_id, album_id } = req.body;


  if (!user_id || !album_id) {
    return res.status(400).send("Missing required fields");
  }

  const sql = "DELETE FROM `favorites` WHERE `user_id` = ? AND `album_id` = ?";
  try {
    await promisePool.query(sql, [user_id, album_id]);
    res.status(200).send("Album removed from favorites successfully");
  } catch (err) {
    console.error("Error removing from favorites:", err);
    res
      .status(500)
      .send({ error: "Internal Server Error", message: err.message });
  }
});

// Endpoint for fetching favorites
app.get("/favorites/:user_id", async (req, res) => {
  const sql = "SELECT * FROM `favorites` WHERE `user_id` = ?";
  try {
    const [results] = await promisePool.query(sql, [req.params.user_id]);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res
      .status(500)
      .send({ error: "Internal Server Error", message: err.message });
  }
});

// Add this route to your server
app.get("/profile", async (req, res) => {
  const accessToken = req.query.access_token;

  if (!accessToken) {
    return res.status(400).send("Access token is required");
  }

  try {
    const profileResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    res.status(200).json(profileResponse.data);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).send("Error fetching user profile");
  }
});

// Create or update a review
app.post("/review", async (req, res) => {
  const { userId, displayName, albumId, albumName, albumImage, rating, reviewText, isPrivate } = req.body;
  if (!userId || !albumId || !rating) {
    return res.status(400).json({ error: "userId, albumId, and rating are required" });
  }
  try {
    await promisePool.query(
      `INSERT INTO reviews (user_id, display_name, album_id, album_name, album_image, rating, review_text, is_private)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE display_name = ?, rating = ?, review_text = ?, is_private = ?, created_at = CURRENT_TIMESTAMP`,
      [userId, displayName || null, albumId, albumName, albumImage, rating, reviewText || null, isPrivate ? 1 : 0,
       displayName || null, rating, reviewText || null, isPrivate ? 1 : 0]
    );
    res.status(200).json({ message: "Review saved" });
  } catch (err) {
    console.error("Error saving review:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get public reviews for an album
app.get("/reviews/album/:albumId", async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      "SELECT * FROM reviews WHERE album_id = ? AND is_private = FALSE ORDER BY created_at DESC",
      [req.params.albumId]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching album reviews:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all reviews by a user (own profile — includes private)
app.get("/reviews/user/:userId", async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      "SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC",
      [req.params.userId]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching user reviews:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get public reviews by a user (public profile)
app.get("/reviews/public/:userId", async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      "SELECT * FROM reviews WHERE user_id = ? AND is_private = FALSE ORDER BY created_at DESC",
      [req.params.userId]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching public user reviews:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a review
app.delete("/review/:id", async (req, res) => {
  const { userId } = req.body;
  try {
    await promisePool.query(
      "DELETE FROM reviews WHERE id = ? AND user_id = ?",
      [req.params.id, userId]
    );
    res.status(200).json({ message: "Review deleted" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", async (req, res) => {
  try {
    res.send({ data: "Hello World" });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Internal Server Error", message: error.message });
  }
});

// Follow a user
app.post("/follow", async (req, res) => {
  const { followerId, followingId } = req.body;
  if (!followerId || !followingId || followerId === followingId)
    return res.status(400).json({ error: "Invalid follow request" });
  try {
    await promisePool.query(
      "INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)",
      [followerId, followingId]
    );
    res.status(200).json({ message: "Followed" });
  } catch (err) {
    console.error("Error following user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Unfollow a user
app.post("/unfollow", async (req, res) => {
  const { followerId, followingId } = req.body;
  if (!followerId || !followingId)
    return res.status(400).json({ error: "Missing fields" });
  try {
    await promisePool.query(
      "DELETE FROM follows WHERE follower_id = ? AND following_id = ?",
      [followerId, followingId]
    );
    res.status(200).json({ message: "Unfollowed" });
  } catch (err) {
    console.error("Error unfollowing user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get follower + following counts for a user
app.get("/follow/counts/:userId", async (req, res) => {
  try {
    const [[followerRows], [followingRows]] = await Promise.all([
      promisePool.query("SELECT COUNT(*) AS followers FROM follows WHERE following_id = ?", [req.params.userId]),
      promisePool.query("SELECT COUNT(*) AS following FROM follows WHERE follower_id = ?", [req.params.userId]),
    ]);
    res.status(200).json({ followers: followerRows[0].followers, following: followingRows[0].following });
  } catch (err) {
    console.error("Error fetching follow counts:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Check if a user is following another
app.get("/is-following", async (req, res) => {
  const { followerId, followingId } = req.query;
  if (!followerId || !followingId)
    return res.status(400).json({ error: "Missing fields" });
  try {
    const [rows] = await promisePool.query(
      "SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?",
      [followerId, followingId]
    );
    res.status(200).json({ isFollowing: rows.length > 0 });
  } catch (err) {
    console.error("Error checking follow status:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get bio for a user
app.get("/bio/:userId", async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      "SELECT bio FROM user_bios WHERE user_id = ?",
      [req.params.userId]
    );
    res.status(200).json({ bio: rows[0]?.bio || "" });
  } catch (err) {
    console.error("Error fetching bio:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Save bio for a user
app.post("/bio", async (req, res) => {
  const { userId, bio } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  try {
    await promisePool.query(
      "INSERT INTO user_bios (user_id, bio) VALUES (?, ?) ON DUPLICATE KEY UPDATE bio = ?",
      [userId, bio, bio]
    );
    res.status(200).json({ message: "Bio saved" });
  } catch (err) {
    console.error("Error saving bio:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Spotify Login Endpoint
app.get("/login", (req, res) => {
  const scope = "user-read-private user-read-email";
  const queryParams = querystring.stringify({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URI,
  });

  res.redirect("https://accounts.spotify.com/authorize?" + queryParams);
});

// Get liked items for a user
app.get("/liked_items", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const [likedItems] = await promisePool.query(
      "SELECT * FROM liked_items WHERE user_id = ?",
      [userId]
    );
    res.status(200).json({ likedItems });
  } catch (error) {
    console.error("Error fetching liked items:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch liked items", error: error.message });
  }
});

// Spotify Callback Endpoint
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    res.redirect(
      `http://127.0.0.1:5173?access_token=${access_token}&refresh_token=${refresh_token}`
    );
  } catch (err) {
    console.error("Error getting tokens:", err);
    res.status(500).send("Error during the Spotify authentication process");
  }
});

app.get("/refresh_token", async (req, res) => {
  const refresh_token = req.query.refresh_token;

  if (!refresh_token) return res.status(400).send("Missing refresh token");

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: refresh_token,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error refreshing token:", err);
    res.status(500).send("Error refreshing access token");
  }
});

app.listen(port, () => console.log(`App is running on Port ${port}`));
