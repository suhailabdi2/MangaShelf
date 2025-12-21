const mongoose = require("mongoose");
const mangaSchema = new mongoose.Schema({
    mal_id:{
        type:String,
        required:true,
        unique:true
    },
    coverImage:{
        type:String,
        required:true
    },
    mangaTitle:{
        type:String,
        required:true
    },
    publishedFrom:{
        type:Date,
    },
    score:{
        type:Number,
        min:0,
        max:10,
        default:0
    },
    synopsis:{
        type:String,
        default:"No synopsis available"
    },
    author:{
        type:String,
        default:"Unknown"
    },
});
module.exports = mongoose.model("Manga",mangaSchema);
