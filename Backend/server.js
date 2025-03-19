const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./Config/db");
const bodyParser = require("body-parser");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/chats", require("./Routes/chatRoutes"));
app.use("/api/messages", require("./Routes/messageRoutes"));

app.get("/", (req, res) => {
  res.send("🚀 Backend is running successfully on Vercel!");
});

module.exports = app;
