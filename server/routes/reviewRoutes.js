const express = require("express");
const router = express.Router();
const controller = require("../controllers/reviewController");
const authenticate  = require("../middleware/auth");
router.post("/postreview/:mal_id",authenticate,controller.createReview);
module.exports=router;