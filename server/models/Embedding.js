const mongoose = require("mongoose");

const embeddingSchema = new mongoose.Schema(
  {
    mangaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manga",
      required: true,
      unique: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      default: "local-hash-v1",
    },
    dimension: {
      type: Number,
      required: true,
    },
    vector: {
      type: [Number],
      required: true,
    },
    contentHash: {
      type: String,
      required: true,
      index: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

embeddingSchema.index({ generatedAt: -1 });

module.exports = mongoose.model("Embedding", embeddingSchema);
