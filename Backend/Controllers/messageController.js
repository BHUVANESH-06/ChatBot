const Message = require("../Models/Message");

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId }).sort("timestamp");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};

exports.createMessage = async (req, res) => {
  const { chatId, text, sender, image } = req.body;
  try {
    const newMessage = new Message({ chatId, text, sender, image });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending message" });
  }
};
