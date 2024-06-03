const express = require("express");
const app = express();
const mysql = require("mysql");
const port = 8000;
const cors = require("cors");
const { data } = require("autoprefixer");

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
  const sql = "INSERT INTO `favorites` (`user_id`, `album_id`, `album_name`, `album_image`, `album_url`) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [user_id, album_id, album_name, album_image, album_url], (err, result) => {
    if (err) {
      console.error("Error adding to favorites:", err);
      return res.status(500).send(err);
    }
    res.status(200).send("Album added to favorites successfully");
  });
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

app.listen(port, () => console.log(`App is running on Port ${port}`));
// Search up callback function to understand the above
