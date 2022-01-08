require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to database"));

app.get("/ping", (req, res) => {
  res.send("Pong!");
});

const PORT = process.env.PORT || 42069;

app.listen(PORT, () => console.log(`Server started in port ${PORT}`));