import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// For production with Gmail
const createProductionTransport = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
    requireTLS: true,
  });
};

export const sendVerificationEmail = async (email, token) => {
  const transporter = createProductionTransport();

  const verificationLink = `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email address",
    html: `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            padding: 30px;
            text-align: center;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 20px;
        }
        h1 {
            color: #2c3e50;
            margin-bottom: 15px;
        }
        .verification-link {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            transition: background-color 0.3s ease;
        }
        .verification-link:hover {
            background-color: #2980b9;
        }
        .expiry-notice {
            color: #7f8c8d;
            font-size: 0.9em;
            margin-top: 20px;
        }
        .footer {
            margin-top: 30px;
            font-size: 0.8em;
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <div class="container">
        
        <h1>Verify Your Email Address</h1>
        
        <p>Welcome! To complete your account setup, please verify your email address by clicking the button below.</p>
        
        <a href="${verificationLink}" class="verification-link">Verify Email Address</a>
        
        <p class="expiry-notice">
            This verification link will expire in 24 hours. 
            If you didn't create an account, please ignore this email.
        </p>
        
        <div class="footer">
            <p>© 2024 CA Saab. All rights reserved.</p>
            <p>If you're having trouble, copy and paste this link into your browser:</p>
            <p>${verificationLink}</p>
        </div>
    </div>
</body>
</html>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV !== "production") {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send verification email");
  }
};
