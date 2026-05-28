const Manga = require("../models/Manga");
const axios = require("axios");
async function fetchManga(req,res){
    try{
        const {mal_id} = req.params;
        console.log(mal_id);
        const mangaSearch = await Manga.findOne({mal_id: String(mal_id)});
        if(mangaSearch){
            return res.status(200).json(mangaSearch);
        }
        const response = await axios.get(`https://api.jikan.moe/v4/manga/${mal_id}`);
        const mangaData = response.data.data;
        const manga = await Manga.create({
            mal_id: String(mangaData.mal_id),
            mangaTitle: mangaData.title_english || mangaData.title || "Untitled",
            coverImage: mangaData.images.jpg.image_url,
            synopsis: mangaData.synopsis || "No synopsis available",
            score: mangaData.score || 0,
            author: mangaData.authors[0]?.name || "Unknown",
            genres: (mangaData.genres || []).map((x) => x.name),
            tags: (mangaData.explicit_genres || []).map((x) => x.name),
            themes: (mangaData.themes || []).map((x) => x.name),
            demographics: (mangaData.demographics || []).map((x) => x.name),
            popularityRank: mangaData.popularity || 0,
            members: mangaData.members || 0,
            favoritesCount: mangaData.favorites || 0,
        });
        return res.status(200).json(manga);
    }catch(error){
        return res.status(400).json({message:error});
    }
};
async function searchManga(req,res){
    try{
        const {q} = req.query;
        if(!q){
            return res.status(400).json({message:"No queries searched for"});
        }
        const response = await axios.get(`https://api.jikan.moe/v4/manga?q=${q}&limit=5&order_by=popularity&sfw=true`);
        res.status(200).json({
            results:response.data.data,
            pagination:response.data.pagination
        });
    }catch(error){
        return res.status(500).json({message:error});
    }
}
module.exports={
    fetchManga,searchManga
}