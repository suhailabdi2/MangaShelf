const Review = require("../models/Review");
const mongoose = require("mongoose");
const Manga= require("../models/Manga");
const User = require("../models/User");
async function createReview(req,res) {
    const {rating, comment,spoilerTagged}= req.body;
    const{mal_Id}= req.params;
    const userId= req.user.user.id;
    if(!userId){
        return res.status(500).json({error:"No user id", userId:userId});
    }
    if(!rating || !comment){
        return res.status(400).json({error:"No message"});
    };
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const review = Review.create({
            userId:userId,
            rating:rating,
            mal_Id:mal_Id,
            spoilerTagged: spoilerTagged
        });
        const manga = await Manga.findOne({mal_Id}).session(session);
        const newCount = manga.reviewCount +1;
        const newAverage = ((manga.score * manga.reviewCount) + rating) / newCount;
        manga.reviewCount= newCount;
        manga.score= newAverage;
        await manga.save({session});
        await session.commitTransaction();
        res.status(201).json({message:"Review created"});
    }
    catch(error){
        await session.abortTransaction();
        if(error.code=== 11000 ) {
            return res.status(400).json({error:"you already reviewed this manga"});
        }
        return res.status(500).json({message:"Failed to add the manga"});
    }finally{
        session.endSession();
    }
}
module.exports = {
    createReview
}