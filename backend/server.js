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
    "INSERT INTO `liked_items` (`item_id`, `item_type`, `name`) VALUES (?, ?, ?)";
  try {
    db.query(sql, [req.body.item, req.body.type, req.body.name]);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/unlike", async (req, res) => {
  let sql = "DELETE FROM liked_items WHERE item_id = ?";
  try {
    db.query(sql, [req.body.item]);
  } catch (err) {
    res.status(500).send(err);
  }
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
