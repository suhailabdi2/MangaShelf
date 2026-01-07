const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinary");
const authenticate = require("../middleware/auth");

const userController = require("../controllers/userController");
router.post("/signup",userController.userSignUp);
router.post("/login",userController.userLogin);
router.post("/upload-profile-picture", authenticate, upload.single("profilePicture"), userController.uploadProfilePicture);
router.get("/get-profile-picture/:userId",userController.getProfilePicture);
module.exports= router; 