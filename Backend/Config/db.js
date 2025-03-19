require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");

const connectDB = async () => {
  console.log("MONGO_URI:", process.env.MONGO_URI);

  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing. Check your .env file.");
    process.exit(1);
  }

  try {

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
