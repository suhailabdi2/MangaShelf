const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const {CloudinaryStorage} = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloud_api_key: process.env.CLOUDINARY_API_KEY,
    cloud_api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params:{
        folder: "MangaShelf",
        allowedFormats: ["jpg", "jpeg", "png"],
        transformation: [{width: 500, height: 500, crop: "limit"}]
    }
});
const upload = multer({storage: storage,
    limits:{
        fileSize: 1024 * 1024 * 5,
    }
});


module.exports = { cloudinary, upload };