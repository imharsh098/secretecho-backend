import express from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import Chat from "../models/Chat.js";
import { authenticateToken } from "../middleware/auth.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Get chat history for a user
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.userId })
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
      flowiseChatId: req.params.chatId,
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
        flowiseChatId: chatId,
        userId: req.user.userId,
      });
    }

    if (!chat) {
      chat = new Chat({
        userId: req.user.userId,
        title: message.substring(0, 30) + "...",
        messages: [],
        flowiseChatId: null,
      });
    }

    // Add user message
    chat.messages.push({
      content: message,
      sender: "user",
    });

    // Call Flowise API
    const response = await axios.post(
      process.env.FLOWISE_URL,
      {
        question: message,
      },
      {
        headers: {
          Authorization: process.env.FLOWISE_API_KEY,
        },
      }
    );
    console.log(response);
    // Add bot response
    chat.messages.push({
      content: response.data.text,
      sender: "bot",
    });
    chat.flowiseChatId = response.data.chatId;

    await chat.save();
    res.json({ chatId: chat.flowiseChatId, response: response.data.text });
  } catch (error) {
    console.error("Error processing chat:", error);
    res.status(500).json({ message: "Error processing chat message" });
  }
});

export default router;
