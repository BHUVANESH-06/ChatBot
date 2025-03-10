const Chat = require("../Models/Chat");

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ isDeleted: false });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chats" });
  }
};

exports.createChat = async (req, res) => {
  const { chatId, chatName } = req.body;
  try {
    const newChat = new Chat({ chatId, chatName });
    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({ message: "Error creating chat" });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    await Chat.findOneAndUpdate({ chatId: req.params.chatId }, { isDeleted: true });
    res.json({ message: "Chat deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting chat" });
  }
};
