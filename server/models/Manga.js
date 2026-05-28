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
    reviewCount:{
        type:Number,
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
    genres: {
        type: [String],
        default: []
    },
    tags: {
        type: [String],
        default: []
    },
    themes: {
        type: [String],
        default: []
    },
    demographics: {
        type: [String],
        default: []
    },
    popularityRank: {
        type: Number,
        default: 0
    },
    members: {
        type: Number,
        default: 0
    },
    favoritesCount: {
        type: Number,
        default: 0
    },
});

mangaSchema.index({ mal_id: 1 }, { unique: true });
mangaSchema.index({ genres: 1, themes: 1, demographics: 1 });
mangaSchema.index({ popularityRank: 1, score: -1, reviewCount: -1 });

module.exports = mongoose.model("Manga",mangaSchema);
