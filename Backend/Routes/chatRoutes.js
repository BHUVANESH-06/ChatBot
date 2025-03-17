const express = require("express");
const router = express.Router();
const { getChats, createChat, deleteChat,getAllChats, updateChatName } = require("../Controllers/chatController");

router.get("/", getChats);  
router.get("/allChats", getAllChats); 
router.post("/", createChat); 
router.delete("/:chatId", deleteChat);
router.put('/update/:chatId',updateChatName)
module.exports = router;
