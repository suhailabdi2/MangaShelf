const express = require("express");
const router = express.Router();
const controller = require("../controllers/reviewController");
const authenticate  = require("../middleware/auth");
router.post("/postreview/:mal_id",authenticate,controller.createReview);

// Delete a review by id for a specific manga
router.delete("/deletereview/:mal_id/:reviewId", authenticate, controller.deleteReview);

module.exports=router;