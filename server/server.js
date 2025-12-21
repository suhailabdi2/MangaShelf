const express = require("express");
require("dotenv").config();
const PORT =process.env.PORT;
const app = express();
const connectDB= require("./config/db");
const mangaRoutes= require("./routes/mangaRoutes");
const userRoutes = require("./routes/userRoutes");
connectDB();
app.use(express.json());
app.use("/api/users",userRoutes);
app.use("/api/manga",mangaRoutes);
// app.use("/api/manga",)
app.get("/", (req,res)=> {
    console.log("Server works");
    res.status(200).json({message:"Server works"});
});
app.listen(PORT,()=>{
    console.log(`Listening at port ${PORT}`);
});
