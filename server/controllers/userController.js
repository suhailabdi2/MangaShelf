const User = require("../models/User");
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

module.exports={
    userSignUp,
}