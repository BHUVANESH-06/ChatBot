const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    console.log(process.env.MONGO_URI)
  try {
    await mongoose.connect("mongodb+srv://bhuvaneshg:deepakbhuvi@cluster0.e2m47pj.mongodb.net/MiniGpt?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully! 🚀");
  } catch (error) {
    console.error("MongoDB connection failed ❌", error);
    process.exit(1);
  }
};

module.exports = connectDB;
