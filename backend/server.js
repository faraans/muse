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

// Define the Spotify credentials and redirect URI from environment variables
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// Create a MySQL connection pool instead of a single connection
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "muse-db",
  waitForConnections: true, // Ensures connections are queued while others are in use
  connectionLimit: 10, // Max number of connections in the pool
  queueLimit: 0, // Unlimited waiting queries
});

// Use the promise-based pool for cleaner async/await code
const promisePool = db.promise();

// Test the MySQL connection at the start
promisePool
  .query("SELECT 1")
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection error", err));

// Endpoint for liking an item
app.post("/like", async (req, res) => {
  const { item, type, name, userId } = req.body;

  // Validation: Ensure all fields are provided
  if (!item || !type || !name || !userId) {
    return res.status(400).send("Missing required fields");
  }

  // Log the incoming request body
  console.log("Incoming /like request body:", req.body);

  const sql =
    "INSERT IGNORE INTO `liked_items` (`item_id`, `item_type`, `name`, `user_id`) VALUES (?, ?, ?, ?)";
  try {
    await promisePool.query(sql, [item, type, name, userId]);
    console.log("Item liked successfully");
    res.status(200).send("Item liked successfully");
  } catch (err) {
    // Log the SQL error message
    console.error("SQL Error:", err);
    res
      .status(500)
      .send({ error: "Internal Server Error", message: err.message });
  }
});

// Endpoint for unliking an item
app.post("/unlike", async (req, res) => {
  const { item, userId } = req.body;

  // Validation: Ensure all fields are provided
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

  // Validation: Ensure all fields are provided
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

  // Validation: Ensure all fields are provided
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

  console.log("Access token received:", accessToken); // Log the access token

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

app.get("/", async (req, res) => {
  try {
    res.send({ data: "Hello World" });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Internal Server Error", message: error.message });
  }
});

// Spotify Login Endpoint
app.get("/login", (req, res) => {
  const scope = "user-read-private user-read-email";
  const queryParams = querystring.stringify({
    response_type: "code",
    client_id: CLIENT_ID, // Use CLIENT_ID from .env
    scope: scope,
    redirect_uri: REDIRECT_URI, // Use REDIRECT_URI from .env
  });

  res.redirect("https://accounts.spotify.com/authorize?" + queryParams);
});

// Get liked items for a user
app.get("/liked_items", async (req, res) => {
  const { userId } = req.query; // Extract userId from query params

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Fetch the liked items for the given userId from the database
    const [likedItems] = await promisePool.query(
      "SELECT * FROM liked_items WHERE user_id = ?",
      [userId]
    );
    res.status(200).json({ likedItems }); // Send the liked items as a JSON response
  } catch (error) {
    console.error("Error fetching liked items:", error); // Log the error
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
