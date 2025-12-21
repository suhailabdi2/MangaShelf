const express = require ("express");
const router = express.Router();
const mangaController= require("../controllers/mangaController");
router.get("/search/:q",mangaController.fetchManga);

module.exports=router;