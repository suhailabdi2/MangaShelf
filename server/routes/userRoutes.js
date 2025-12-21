const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/signup", async(req,res)=> {
    try{
        const  {userName,userEmail,password} = req.body;
        if(!userEmail || !userName){
            return res.status(400).json({error:"UserName/Email is empty"})
        }
        if(password.length < 6){
            return res.status(400).json({error:"Password too short"})
        }
        const existingUser= await User.findOne({userEmail});
        if(existingUser){
            return res.status(400).json({error:"USer exists already"});
        }
        const user = await User.create({
            userName,
            userEmail,
            password
        });
        

        res.status(201).json({user});
    }catch(error){
        return res.status(500).json({message:error.message})
    }
});

module.exports= router;