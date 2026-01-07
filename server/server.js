const express = require("express");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 3001;
const app = express();

const connectDB = require("./config/db");
const mangaRoutes = require("./routes/mangaRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const readingStatusRoutes = require("./routes/readingStatusRoutes");

connectDB();

// Middleware
app.use(express.json());

// Allow requests from the Next.js dev server
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/manga", mangaRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/status", readingStatusRoutes);

app.get("/", (req, res) => {
  console.log("Server works");
  res.status(200).json({ message: "Server works" });
});

app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
});
