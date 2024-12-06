import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// For development/testing with Ethereal
const createTestAccount = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

// For production with Gmail
const createProductionTransport = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendVerificationEmail = async (email, token) => {
  const transporter =
    process.env.NODE_ENV === "production"
      ? createProductionTransport()
      : await createTestAccount();

  const verificationLink = `http://localhost:3000/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER || '"Test Account" <test@example.com>',
    to: email,
    subject: "Verify your email address",
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>This link will expire in 24 hours.</p>
    `,
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
