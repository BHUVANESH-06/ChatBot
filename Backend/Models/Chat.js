const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  chatId: { type: Number, required: true, unique: true },
  chatName: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("Chat", chatSchema);
