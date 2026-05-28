const recommendationService = require("../services/recommendation/recommendationService");

async function getRecommendations(req, res) {
  try {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const payload = await recommendationService.getForUserRecommendations(userId, limit);
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Get recommendations error:", error);
    return res.status(500).json({ error: "Failed to generate recommendations" });
  }
}

async function getForYou(req, res) {
  return getRecommendations(req, res);
}

async function getSimilar(req, res) {
  try {
    const { mangaId } = req.params;
    const payload = await recommendationService.getSimilarRecommendationsByMalId(mangaId);
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Get similar recommendations error:", error);
    return res.status(500).json({ error: "Failed to generate similar recommendations" });
  }
}

async function getTrending(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const payload = await recommendationService.getTrendingRecommendations(limit);
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Get trending recommendations error:", error);
    return res.status(500).json({ error: "Failed to generate trending recommendations" });
  }
}

module.exports = {
  getRecommendations,
  getForYou,
  getSimilar,
  getTrending,
};
