const mongoose = require("mongoose");

const USER_MANGA_STATUSES = ["plan_to_read", "reading", "completed", "dropped"];

const userMangaLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mangaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manga",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: USER_MANGA_STATUSES,
      required: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastInteractedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

userMangaLogSchema.index({ userId: 1, mangaId: 1 }, { unique: true });
userMangaLogSchema.index({ userId: 1, status: 1, updatedAt: -1 });

module.exports = {
  UserMangaLog: mongoose.model("UserMangaLog", userMangaLogSchema),
  USER_MANGA_STATUSES,
};
