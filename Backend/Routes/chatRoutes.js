const express = require("express");
const router = express.Router();
const { getChats, createChat, deleteChat } = require("../Controllers/chatController");

router.get("/", getChats);  
router.post("/", createChat); 
router.delete("/:chatId", deleteChat);

module.exports = router;
