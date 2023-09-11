const express = require("express");
const app = express();
const mysql = require("mysql");
const port = 8000;
const cors = require("cors");

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

app.post("/login", (req, res) => {
  const email = req.body.params.email;
  const password = req.body.params.password;
  db.query(
    `SELECT * FROM user WHERE UserEmail = "${email}" AND UserPassword = "${password}"`,
    [email, password],
    (err, data) => {
      console.log(req);
      if (err) return res.json(console.log(err));
      if (data.length > 0) {
        return res.json("Login Succesfully");
      } else {
        return res.json("No record");
      }
    }
  );
});

app.get("/", (req, res) => {
  res.send({ data: "Hello World" });
});

app.listen(port, () => console.log(`App is running on Port ${port}`));
// Search up callback function to understand the above
