import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { authenticateToken } from "../middleware/auth.js";
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/emailService.js';

const router = express.Router();
const JWT_SECRET = "sampler"; // In production, use environment variable

router.post("/signup", async (req, res) => {
  try {
    let { name, email, password, phone } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    password = await bcrypt.hash(password, 10);
    
    const user = new User({ 
      name, 
      email, 
      password, 
      phone,
      verificationToken,
      verificationTokenExpiry,
      isVerified: false
    });
    
    try {
      await sendVerificationEmail(email, verificationToken);
      await user.save();
    } catch (emailError) {
      console.error('Email error:', emailError);
      return res.status(500).json({ 
        message: "Failed to send verification email. Please try again later." 
      });
    }

    res.status(201).json({ message: "User created successfully. Please check your email for verification." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: "Please verify your email before logging in" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        city: user.city,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying email" });
  }
});

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, phone, country, city } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.country = country || user.country;
    user.city = city || user.city;

    await user.save();
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        city: user.city,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

export default router;
