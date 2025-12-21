const express = require("express");
const Manga = require("../models/Manga");
const axios = require("axios");
async function fetchManga(req,res){
    try{
        const {q} = req.params;
        const mangaSearch = await Manga.find({mangaTitle:q});
        if(mangaSearch.length> 0){
            return res.status(200).json(mangaSearch[0]);
        }
        console.log(`https://api.jikan.moe/v4/manga?q=${q}`);
        const response = await axios.get(`https://api.jikan.moe/v4/manga?q=${q}`);
        const mangaData = response.data.data[0];
        const manga = await Manga.create({
            mal_id: mangaData.mal_id,
            mangaTitle: mangaData.title_english,
            coverImage: mangaData.images.jpg.image_url,
            synopsis: mangaData.synopsis || "No synopsis available",
            score: mangaData.score || 0,
            author: mangaData.authors[0]?.name || "Unknown",
        });
        return res.status(200).json(manga);
    }catch(error){
        return res.status(400).json({message:error});
    }
};

module.exports={
    fetchManga
}