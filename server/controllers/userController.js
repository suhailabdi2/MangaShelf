const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { cloudinary, upload } = require("../config/cloudinary");
async function userSignUp(req,res){
    try{
            const  {userName,userEmail,password} = req.body;
            if(!userEmail || !userName || !password){
                return res.status(400).json({error:"UserName/Email/Password is empty"})
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
            res.status(201).json({message:"User created"});
        }catch(error){
            return res.status(500).json({message:error.message})
        }
}
async function userLogin(req,res){
    const {userEmail,password} = req.body;
    if (!userEmail || !password) {
         return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findOne({userEmail}).select('+password');
    console.log(user);
    if (!user) {
        console.log("problem is here");
            return res.status(401).json({ error: "Invalid email or password" });
    }
    const isMatch = await user.comparePassword(password);
    if(!isMatch){
        console.log("wrong rende");
        return res.status(401).json({error:"Invalid email or password"});
    }
    const token = jwt.sign({
        userId:user._id,
        userEmail:user.userEmail,
        userName:user.userName
    },
    process.env.JWT_TOKEN,
    {expiresIn:'7d'}
    );
    return res.status(200).json({
        message:"Login succesful",
        token,
        user:{
            id:user._id,
            userName:user.userName,
            userEmail:user.userEmail,
            profilePicture:user.profilePicture
        }
    });
}
async function uploadProfilePicture(req,res){
    try{
        const {userId} = req.user;
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error:"User not found"});
        }
        if(user.profilePicture){
            await cloudinary.uploader.destroy(user.profilePicture);
        }
        const result = await cloudinary.uploader.upload(req.file.path);
        user.profilePicture = result.secure_url;
        await user.save();
        return res.status(200).json({
            message:"Profile picture uploaded",
            profilePicture:user.profilePicture
        });
    }catch(error){
        return res.status(500).json({error:error.message});
    }
};
async function getProfilePicture(req,res){
    try{
        const {userId} = req.params;
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error:"User not found"});
        }
        return res.status(200).json({
            profilePicture:user.profilePicture
        });
    }catch(error){
        return res.status(500).json({error:error.message});
    }
};
module.exports={
    userSignUp,userLogin,uploadProfilePicture,getProfilePicture
};