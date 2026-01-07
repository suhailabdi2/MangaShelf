const express = require("express");
const router = express.Router();
const controller = require("../controllers/readingStatusController");
const authenticate = require("../middleware/auth");

// Set or update reading status (requires auth)
router.post("/:mal_id", authenticate, controller.setReadingStatus);

// Get reading status for a specific manga (requires auth)
router.get("/manga/:mal_id", authenticate, controller.getReadingStatus);

// Get all manga for a user, optionally filtered by status
router.get("/user/:userId", controller.getUserMangaByStatus);
router.get("/user/:userId/:status", controller.getUserMangaByStatus);

// Remove reading status (requires auth)
router.delete("/:mal_id", authenticate, controller.removeReadingStatus);

module.exports = router;

