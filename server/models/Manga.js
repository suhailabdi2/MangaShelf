const mongoose = require("mongoose");
const mangaSchema = new mongoose.Schema({
    mangaTitle:{
        type:String,
        required:true
    },
    publishedFrom:{
        type:Date,
        required:true
    },
    score:{
        type:Number,
        required:true
    },
    synopsis:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
});
model.exports = mongoose.model("Manga",mangaSchema);
