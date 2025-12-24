const User = require("../models/User");
const jwt = require("jsonwebtoken");
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
            userEmail:user.userEmail
        }
    });
}
module.exports={
    userSignUp,userLogin
};