const mongoose = require("mongoose");

const readingStatusSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    mangaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Manga",
        required: true
    },
    status: {
        type: String,
        enum: ["plan_to_read", "reading", "completed", "on_hold", "dropped"],
        required: true
    }
}, { timestamps: true });

// Ensure one status per user per manga
readingStatusSchema.index({ userId: 1, mangaId: 1 }, { unique: true });

module.exports = mongoose.model("ReadingStatus", readingStatusSchema);

