const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatId: { type: Number, required: true },
  text: { type: String },
  sender: { type: String, required: true }, 
  image: { type: String, default: null }, 
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
