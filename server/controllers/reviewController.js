const Review = require("../models/Review");
const mongoose = require("mongoose");
const Manga= require("../models/Manga");
const User = require("../models/User");
async function createReview(req,res) {
    const {rating, comment,spoilerTagged}= req.body;
    const { mal_id } = req.params;
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
        return res.status(401).json({ error: "No user id" });
    }
    // Convert to ObjectId if it's a string
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;
    if (!rating || !comment) {
        return res.status(400).json({ error: "No message" });
    };
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        console.log(mal_id);
        const manga = await Manga.findOne({ mal_id }).session(session);
        if (!manga) {
            await session.abortTransaction();
            return res.status(404).json({ error: "Manga not found" });
        }
        console.log(manga._id);
        // create review within the transaction session
        const review = new Review({
            userId: userObjectId,
            rating: Number(rating),
            comment: comment,
            mangaId: manga._id,
            spoilerTagged: Boolean(spoilerTagged)
        });
        await review.save({ session });
        const newCount = manga.reviewCount + 1;
        const newAverage = ((manga.score * manga.reviewCount) + Number(rating)) / newCount;
        manga.reviewCount = newCount;
        manga.score = newAverage;
        await manga.save({session});
        await session.commitTransaction();
        res.status(201).json({message:"Review created"});
    }
    catch(error){
        await session.abortTransaction();
        if(error.code=== 11000 ) {
            return res.status(400).json({error:"you already reviewed this manga"});
        }
        console.error(error);
        return res.status(500).json({message:"Failed to add the review"});
    }finally{
        session.endSession();
    }
}
async function deleteReview(req,res){
    const { mal_id, reviewId } = req.params;
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
        return res.status(401).json({ error: "No user id" });
    }
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const manga = await Manga.findOne({ mal_id }).session(session);
        if(!manga){
            await session.abortTransaction();
            return res.status(404).json({ error: "Manga not found" });
        }
        const review = await Review.findOne({ _id: reviewId, mangaId: manga._id }).session(session);
        if(!review){
            await session.abortTransaction();
            return res.status(404).json({ error: "Review not found" });
        }
        // Only the owner can delete their review
        if(review.userId.toString() !== userObjectId.toString()){
            await session.abortTransaction();
            return res.status(403).json({ error: "Not authorized to delete this review" });
        }
        const rating = Number(review.rating);
        await review.deleteOne({ session });
        const newCount = Math.max(0, manga.reviewCount - 1);
        if(newCount === 0){
            manga.reviewCount = 0;
            manga.score = 0;
        } else {
            manga.score = ((manga.score * manga.reviewCount) - rating) / newCount;
            manga.reviewCount = newCount;
        }
        await manga.save({ session });
        await session.commitTransaction();
        return res.status(200).json({ message: "Review deleted" });
    }catch(error){
        await session.abortTransaction();
        console.error(error);
        return res.status(500).json({ error: "Failed to delete review" });
    }finally{
        session.endSession();
    }
}
module.exports = {
    createReview,
    deleteReview
}