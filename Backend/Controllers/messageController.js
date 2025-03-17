const Message = require("../Models/Message");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId }).sort("timestamp");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};

exports.createMessage = [
  upload.single("image"),
  async (req, res) => {
    try {
      const { chatId, text, sender } = req.body;
      let image = null;

      if (req.file) {
        image = req.file.buffer.toString("base64");
      }

      const newMessage = new Message({ chatId, text, sender, image });
      await newMessage.save();
      res.status(201).json(newMessage);
    } catch (error) {
      res.status(500).json({ message: "Error sending message" });
    }
  },
];
