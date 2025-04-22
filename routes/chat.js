import express from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import Chat from "../models/Chat.js";
import { authenticateToken } from "../middleware/auth.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Array of dummy responses
const dummyResponses = [
  "That's an interesting question! Let me think about that.",
  "I understand what you're asking. Here's what I think...",
  "Based on my analysis, I would suggest...",
  "That's a great point! Here's my perspective...",
  "Let me help you with that. Here's what you need to know...",
  "I've processed your request and here's my response...",
  "Thanks for asking! Here's what I can tell you...",
  "I'm happy to help! Here's what I know about that...",
  "Let me break this down for you...",
  "Here's my take on your question...",
];

// Get chat history for a user
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.userId, isActive: true })
      .sort({ updatedAt: -1 })
      .select("title updatedAt flowiseChatId");
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat history" });
  }
});

// Get specific chat by ID
router.get("/:chatId", authenticateToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      isActive: true,
      userId: req.user.userId,
    });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat" });
  }
});

// Send a message
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { message, chatId } = req.body;
    let chat;

    if (chatId) {
      chat = await Chat.findOne({
        _id: chatId,
        userId: req.user.userId,
        isActive: true,
      });
    }

    if (!chat) {
      chat = new Chat({
        userId: req.user.userId,
        title: message.substring(0, 30) + "...",
        messages: [],
      });
    }

    // Add user message
    chat.messages.push({
      content: message,
      sender: "user",
    });

    // Select a random response from the array
    const response =
      dummyResponses[Math.floor(Math.random() * dummyResponses.length)];
    // Add bot response
    chat.messages.push({
      content: response,
      sender: "bot",
    });
    await chat.save();
    res.json({ chatId: chat._id, response: response });
  } catch (error) {
    console.error("Error processing chat:", error);
    res.status(500).json({ message: "Error processing chat message" });
  }
});

router.delete("/:chatId", authenticateToken, async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete(
      {
        _id: req.params.chatId,
      },
      { isActive: false },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ message: "Error deleting chat" });
  }
});

export default router;
