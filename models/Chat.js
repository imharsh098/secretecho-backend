import mongoose from "mongoose";
import { connection1 } from "../connect.js";

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    messages: [
      {
        content: {
          type: String,
          required: true,
        },
        sender: {
          type: String,
          enum: ["user", "bot"],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Chat = connection1.model("Chat", chatSchema);
export default Chat;
