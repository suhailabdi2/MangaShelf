const ReadingStatus = require("../models/ReadingStatus");
const Manga = require("../models/Manga");
const mongoose = require("mongoose");

async function setReadingStatus(req, res) {
    try {
        const { mal_id } = req.params;
        const { status } = req.body;
        const userId = req.user?.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: "No user id" });
        }

        if (!status || !["plan_to_read", "reading", "completed", "on_hold", "dropped"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const userObjectId = mongoose.Types.ObjectId.isValid(userId)
            ? new mongoose.Types.ObjectId(userId)
            : userId;

        // Find or create manga
        let manga = await Manga.findOne({ mal_id });
        if (!manga) {
            // If manga doesn't exist, we need to fetch it first
            // For now, return error - user should view manga page first
            return res.status(404).json({ error: "Manga not found. Please view the manga page first." });
        }

        // Find or create reading status
        let readingStatus = await ReadingStatus.findOne({
            userId: userObjectId,
            mangaId: manga._id
        });

        if (readingStatus) {
            readingStatus.status = status;
            await readingStatus.save();
        } else {
            readingStatus = await ReadingStatus.create({
                userId: userObjectId,
                mangaId: manga._id,
                status
            });
        }

        res.status(200).json({
            message: "Reading status updated",
            readingStatus: {
                _id: readingStatus._id,
                status: readingStatus.status,
                mangaId: {
                    _id: manga._id,
                    mal_id: manga.mal_id,
                    mangaTitle: manga.mangaTitle,
                    coverImage: manga.coverImage
                }
            }
        });
    } catch (error) {
        console.error("Set reading status error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ error: "Reading status already exists" });
        }
        return res.status(500).json({ error: "Failed to set reading status" });
    }
}

async function getReadingStatus(req, res) {
    try {
        const { mal_id } = req.params;
        const userId = req.user?.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: "No user id" });
        }

        const userObjectId = mongoose.Types.ObjectId.isValid(userId)
            ? new mongoose.Types.ObjectId(userId)
            : userId;

        const manga = await Manga.findOne({ mal_id });
        if (!manga) {
            return res.status(404).json({ error: "Manga not found" });
        }

        const readingStatus = await ReadingStatus.findOne({
            userId: userObjectId,
            mangaId: manga._id
        });

        if (!readingStatus) {
            return res.status(200).json({ status: null });
        }

        res.status(200).json({ status: readingStatus.status });
    } catch (error) {
        console.error("Get reading status error:", error);
        return res.status(500).json({ error: "Failed to get reading status" });
    }
}

async function getUserMangaByStatus(req, res) {
    try {
        const { userId, status } = req.params;

        if (!userId) {
            return res.status(400).json({ error: "User ID required" });
        }

        const userObjectId = mongoose.Types.ObjectId.isValid(userId)
            ? new mongoose.Types.ObjectId(userId)
            : userId;

        let query = { userId: userObjectId };
        if (status && status !== "all") {
            if (!["plan_to_read", "reading", "completed", "on_hold", "dropped"].includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }
            query.status = status;
        }

        const readingStatuses = await ReadingStatus.find(query)
            .populate("mangaId", "mal_id mangaTitle coverImage score")
            .sort({ updatedAt: -1 });

        res.status(200).json({
            manga: readingStatuses.map(rs => ({
                _id: rs._id,
                status: rs.status,
                updatedAt: rs.updatedAt,
                manga: rs.mangaId
            })),
            total: readingStatuses.length
        });
    } catch (error) {
        console.error("Get user manga by status error:", error);
        return res.status(500).json({ error: "Failed to get user manga" });
    }
}

async function removeReadingStatus(req, res) {
    try {
        const { mal_id } = req.params;
        const userId = req.user?.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({ error: "No user id" });
        }

        const userObjectId = mongoose.Types.ObjectId.isValid(userId)
            ? new mongoose.Types.ObjectId(userId)
            : userId;

        const manga = await Manga.findOne({ mal_id });
        if (!manga) {
            return res.status(404).json({ error: "Manga not found" });
        }

        await ReadingStatus.deleteOne({
            userId: userObjectId,
            mangaId: manga._id
        });

        res.status(200).json({ message: "Reading status removed" });
    } catch (error) {
        console.error("Remove reading status error:", error);
        return res.status(500).json({ error: "Failed to remove reading status" });
    }
}

module.exports = {
    setReadingStatus,
    getReadingStatus,
    getUserMangaByStatus,
    removeReadingStatus
};

