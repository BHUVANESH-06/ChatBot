const express = require("express");
const router = express.Router();
const { getMessages, createMessage } = require("../Controllers/messageController");

router.get("/:chatId", getMessages);
router.post("/", createMessage);

module.exports = router;
