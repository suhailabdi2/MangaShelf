const express = require ("express");
const router = express.Router();
const mangaController= require("../controllers/mangaController");
router.get("/search/:mal_id",mangaController.fetchManga);
router.get("/",mangaController.searchManga);
module.exports=router;