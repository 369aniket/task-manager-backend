# Task Manager Backend API

A robust Node.js and Express.js backend for a Task Management application. This project provides secure user authentication, email verification, password recovery, JWT-based authorization, and user account management functionalities.

## 🚀 Features

* User Registration
* User Login & Logout
* JWT Authentication
* Access Token & Refresh Token Management
* Email Verification
* Resend Verification Email
* Forgot Password
* Reset Password
* Change Password
* Current User Profile
* Secure Password Hashing with Bcrypt
* MongoDB Database Integration
* Request Validation using Express Validator
* Cookie-Based Authentication
* Centralized Error Handling

## 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT (JSON Web Token)
* Bcrypt
* Cookie Parser
* Express Validator
* Nodemailer
* Mailtrap
* Dotenv

## 📁 Project Structure

```bash
src/
├── controllers/
├── db/
├── middelweres/
├── models/
├── routes/
├── utils/
├── validators/
├── app.js
└── index.js
```

## ⚙️ Environment Variables

Create a `.env` file in the root directory and configure the required environment variables.

Refer to `.env.example` for the complete list of variables.

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/369aniket/task-manager-backend.git
```

Move into the project directory:

```bash
cd task-manager-backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using `.env.example` as reference.

Run development server:

```bash
npm run dev
```

Run production server:

```bash
npm start
```

## 🧪 Available Scripts

Run development server with Nodemon:

```bash
npm run dev
```

Run production server:

```bash
npm start
```

## 🔐 Authentication Flow

1. Register User
2. Verify Email
3. Login
4. Receive Access Token & Refresh Token
5. Access Protected Routes
6. Refresh Access Token when expired
7. Logout

## 📬 API Endpoints

### Authentication

| Method | Endpoint                                     |
| ------ | -------------------------------------------- |
| POST   | /api/v1/auth/register                        |
| POST   | /api/v1/auth/login                           |
| GET    | /api/v1/auth/verify-email/:verificationToken |
| POST   | /api/v1/auth/refresh-token                   |
| POST   | /api/v1/auth/forgot-password                 |
| POST   | /api/v1/auth/reset-password/:resetToken      |
| POST   | /api/v1/auth/logout                          |
| POST   | /api/v1/auth/change-password                 |
| POST   | /api/v1/auth/current-user                    |
| POST   | /api/v1/auth/resend-email-verification       |

### Health Check

| Method | Endpoint            |
| ------ | ------------------- |
| GET    | /api/v1/healthcheck |

## 👨‍💻 Author

**Aniket Patel**

Frontend & Backend Developer

GitHub: https://github.com/369aniket

LinkedIn: https://www.linkedin.com/in/aniket-patel-4121b2277

---

Built with ❤️ using Node.js, Express.js, and MongoDB.
