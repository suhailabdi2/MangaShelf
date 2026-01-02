const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
    mangaId: {type:mongoose.Schema.Types.ObjectId,ref: "Manga", required:true},
    userId: {type:mongoose.Schema.Types.ObjectId,ref: "User", required:true},
    comment: String,
    rating:{
        type:Number,
        required:true,
        min:1,
        max:10
    },
    spoilerTagged: {
        type:Boolean,
        default: false
    },
},{timestamps:true});

reviewSchema.index({userId:1, mangaId:1},{ unique:true});
module.exports = mongoose.model('Review', reviewSchema);