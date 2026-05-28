const mongoose = require("mongoose");

const recommendationCacheSchema = new mongoose.Schema(
  {
    cacheKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    type: {
      type: String,
      enum: ["for-you", "similar", "trending", "seasonal", "mood"],
      required: true,
      index: true,
    },
    payload: {
      manga: { type: Array, default: [] },
      scores: { type: Array, default: [] },
      reasoning: { type: Array, default: [] },
      generatedAt: { type: Date, default: Date.now },
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

recommendationCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RecommendationCache", recommendationCacheSchema);
