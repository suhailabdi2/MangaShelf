const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = async () => {
    try {
        console.log(process.env.MONGO_DB_CONNECTION_STRING);
        await mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING);
        console.log("MongoDB connected");
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
