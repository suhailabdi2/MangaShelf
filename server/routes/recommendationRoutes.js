const express = require("express");
const controller = require("../controllers/recommendationController");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, controller.getRecommendations);
router.get("/for-you", authenticate, controller.getForYou);
router.get("/similar/:mangaId", controller.getSimilar);
router.get("/trending", controller.getTrending);

module.exports = router;
