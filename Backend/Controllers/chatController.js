const Chat = require("../Models/Chat");

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ isDeleted: false });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chats" });
  }
};
exports.getAllChats = async (req, res) => {
  try {
    const allChats = await Chat.find();

    if (!allChats || allChats.length === 0) {
      return res.status(404).json({ message: "No chats available" });
    }

    res.status(200).json(allChats);
  } catch (error) {
    console.error("Error fetching all chats:", error);
    res.status(500).json({ message: "Error fetching all chats", error: error.message });
  }
};


exports.createChat = async (req, res) => {
  const { chatId, chatName,isDeleted } = req.body;
  try {
    const newChat = new Chat({ chatId, chatName,isDeleted });
    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({ message: "Error creating chat" ,error:error});
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
exports.updateChatName = async (req, res) => {
  try {
    const { chatName } = req.body;
    console.log(req.params.chatId, chatName);
    const updatedChat = await Chat.findOneAndUpdate(
      { chatId: req.params.chatId }, 
      { chatName: chatName }, 
      { new: true } 
    );

    if (!updatedChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json({ message: "Chat name updated successfully", updatedChat });
  } catch (error) {
    res.status(500).json({ message: "Error updating chat name" });
  }
};
