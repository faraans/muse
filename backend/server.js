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

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "muse-db",
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected");
});

// Define the Spotify credentials and redirect URI from environment variables
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

app.post("/like", async (req, res) => {
  let sql =
    "INSERT INTO `liked_items` (`item_id`, `item_type`, `name`, `user_id`) VALUES (?, ?, ?, ?)";
  try {
    db.query(sql, [
      req.body.item,
      req.body.type,
      req.body.name,
      req.body.userId,
    ]);
    res.status(200).send("Item liked successfully");
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/unlike", async (req, res) => {
  let sql = "DELETE FROM liked_items WHERE item_id = ? AND user_id = ?";
  try {
    db.query(sql, [req.body.item, req.body.userId]);
    res.status(200).send("Item unliked successfully");
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/favorite", (req, res) => {
  const { user_id, album_id, album_name, album_image, album_url } = req.body;
  const sql =
    "INSERT INTO `favorites` (`user_id`, `album_id`, `album_name`, `album_image`, `album_url`) VALUES (?, ?, ?, ?, ?)";
  db.query(
    sql,
    [user_id, album_id, album_name, album_image, album_url],
    (err, result) => {
      if (err) {
        console.error("Error adding to favorites:", err);
        return res.status(500).send(err);
      }
      res.status(200).send("Album added to favorites successfully");
    }
  );
});

app.post("/unfavorite", (req, res) => {
  const { user_id, album_id } = req.body;
  const sql = "DELETE FROM `favorites` WHERE `user_id` = ? AND `album_id` = ?";
  db.query(sql, [user_id, album_id], (err, result) => {
    if (err) {
      console.error("Error removing from favorites:", err);
      return res.status(500).send(err);
    }
    res.status(200).send("Album removed from favorites successfully");
  });
});

app.get("/favorites/:user_id", (req, res) => {
  const sql = "SELECT * FROM `favorites` WHERE `user_id` = ?";
  db.query(sql, [req.params.user_id], (err, results) => {
    if (err) {
      console.error("Error fetching favorites:", err);
      return res.status(500).send(err);
    }
    res.status(200).json(results);
  });
});

app.get("/", async (req, res) => {
  try {
    res.send({ data: "Hello World" });
  } catch (error) {
    res.status(500).send(error);
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

// Spotify Callback Endpoint
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  // Request access token using the authorization code
  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID, // Use CLIENT_ID from .env
        client_secret: CLIENT_SECRET, // Use CLIENT_SECRET from .env
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Handle refresh token
    app.get("/refresh_token", async (req, res) => {
      const refresh_token = req.query.refresh_token;

      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        querystring.stringify({
          grant_type: "refresh_token",
          refresh_token: refresh_token,
          client_id: CLIENT_ID, // Use CLIENT_ID from .env
          client_secret: CLIENT_SECRET, // Use CLIENT_SECRET from .env
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      res.json(response.data); // returns new access_token
    });

    const { access_token, refresh_token } = tokenResponse.data;

    res.redirect(
      `http://localhost:5173?access_token=${access_token}&refresh_token=${refresh_token}`
    );
  } catch (err) {
    console.error("Error getting tokens:", err);
    res.status(500).send("Error during the Spotify authentication process");
  }
});

app.listen(port, () => console.log(`App is running on Port ${port}`));
