# SecretEcho Backend

A robust backend service for the SecretEcho chat application, built with Node.js, Express, and MongoDB.

## 🚀 Features

- RESTful API architecture
- User authentication and authorization
- Secure password hashing with bcrypt
- JWT-based authentication
- MongoDB database integration
- Email functionality with Nodemailer
- CORS enabled for cross-origin requests

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn package manager

## 🛠️ Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd secretecho-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## 📁 Project Structure

```
├── server.js          # Main application entry point
├── connect.js         # Database connection configuration
├── routes/           # API route definitions
├── models/           # MongoDB models
├── middleware/       # Custom middleware functions
├── utils/           # Utility functions and helpers
└── .env             # Environment variables
```

## 🔒 Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Environment variable protection
- CORS configuration
- Input validation and sanitization

## 🙏 Acknowledgments

- Express.js
- MongoDB
- Nodemailer
- JWT
- bcryptjs
