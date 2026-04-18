# 🚀 Backend API - Job board

This is the backend service for the Job board application.
Built with Node.js, Express, MongoDB, JWT authentication, and real-time features.

---

## 📌 Tech Stack

* Node.js + Express
* TypeScript
* MongoDB + Mongoose
* JWT Authentication (Access + Refresh Token)
* Redux-compatible API structure
* Socket.io (Real-time notifications)
* Nodemailer (Email notifications via Gmail SMTP)
* Swagger (API Documentation)
* Jest + Supertest (Testing)

---

📁 Real Project Structure
backend/
├── dist/                     # Compiled JS output
├── node_modules/

├── src/
│   ├── config/
│   │   ├── db.ts            # MongoDB connection
│   │   ├── env.ts           # Environment config
│   │   ├── swagger.ts       # Swagger setup
│   │
│   ├── core/
│   │   ├── errors/          # Custom error classes
│   │   ├── middlewares/     # Auth, error handler
│   │   ├── types/           # Global TS types
│   │   ├── utils/           # Common helpers
│   │
│   ├── modules/             # Feature-based modules
│   │   ├── admin/
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.routes.ts
│   │   │   ├── admin.service.ts
│   │   │   ├── admin.validation.ts
│   │   │
│   │   ├── applications/    # Job application logic
│   │   ├── auth/            # Authentication (JWT)
│   │   ├── jobs/            # Job management
│   │   ├── notifications/   # Notification logic
│   │   ├── users/           # User management
│   │
│   ├── routes/              # Central route loader
│   ├── services/            # Shared services
│   │   ├── emailService.ts  # Email logic (SMTP)
│   │
│   ├── socket/
│   │   ├── socket.ts        # Socket.io setup
│   │
│   ├── app.ts               # Express app config
│   ├── server.ts            # Entry point
│
├── tests/                   # Unit / integration tests
├── .env
├── .env.example
├── jest.config.js
├── nodemon.json
├── package.json
├── tsconfig.json
├── README.md
🧠 Architecture Overview
🔹 Modular Structure (modules/)

Each feature follows clean separation:

module/
 ├── controller.ts   # Handles request/response
 ├── service.ts      # Business logic
 ├── routes.ts       # API routes
 ├── validation.ts   # Request validation
🔹 core/
errors/ → Custom error handling
middlewares/ → Auth, global error handler
utils/ → Common helpers
🔹 services/
Shared reusable services
Example: Email service (Nodemailer)
🔹 socket/
Real-time communication using Socket.io
Used for notifications
🔹 config/
DB connection
Environment variables
Swagger configuration


## ⚙️ Environment Variables

Create a `.env` file in `/backend`:

```

NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/job-board
ACCESS_TOKEN_SECRET=McqWmzXeshgUXah056GDSRS67STS875SFDG75DGSH
ACCESS_TOKEN_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=McqWmzXeshgUXah056GDSRS67STS875SFDG75DGSHREFRESHKEY
REFRESH_TOKEN_EXPIRES_IN=1d

EMAIL_USER=example@gmail.com
EMAIL_PASS=xxxxxxxxxxxxxxxx

```

---

## 🔐 Authentication

### Token System

| Token         | Expiry |
| ------------- | ------ |
| Access Token  | 1 hour |
| Refresh Token | 1 day  |

### Flow

1. User logs in → receives `accessToken` + `refreshToken`
2. Access token used for API calls
3. On expiry → frontend calls `/auth/refresh-token`
4. New access token issued

---

## 🚫 Account Status Validation

* Each user has `isActive` field
* If `isActive = false`:

  * Login is blocked
  * Response: `403 Forbidden`
  * Message: `"Account suspended, please contact admin."`

---

## 🔔 Real-Time Notifications (Socket.io)

### Features

* Candidate applies → Recruiter notified
* Recruiter updates status → Candidate notified

### Events

* `notification`
* `job_applied`
* `application_status_updated`

### Flow

* User joins room using `userId`
* Server emits event using:

  ```
  io.to(userId).emit(...)
  ```

---

## 📧 Email Notifications

### Triggered On:

* Job application
* Application status change (Applied → Shortlisted / Rejected / Selected)

### Setup

* Uses Gmail SMTP via Nodemailer
* Requires App Password (not Gmail password)

---

## 🔍 Advanced Search

Supports:

* Full-text search (`$text`)
* Skills filtering (`$in`)
* Location filtering
* Pagination

### Example:

```
GET /users?q=react developer&skills=node,react&page=1&limit=10
```

---

## 📄 API Documentation (Swagger)

Run server and open:

```
http://localhost:4000/api-docs
```

Includes:

* Auth APIs
* User APIs
* Job APIs
* Application APIs

---

## 🧪 Testing

### Run Tests

```
npm run test
```

### Includes

* Auth API tests
* User API tests
* Application flow tests

---

## ▶️ Running the Project

### Install Dependencies

```
npm install
```

### Start Development Server

```
npm run dev
```

### Production Build

```
npm run build
npm start
```

---

## 🛠️ Common Issues

### Port Already in Use

```
npx kill-port 4000
```

---

### Gmail SMTP Error

* Enable 2FA
* Use App Password
* Do NOT use normal password

---

## 📦 Key Features

* JWT Authentication (Access + Refresh)
* Role-Based Access (Admin / Recruiter / Candidate)
* Real-time notifications
* Email alerts
* Advanced search
* Swagger API docs
* Unit & integration tests

---

## 👨‍💻 Author

Mitul Kalsariya
Senior MERN Stack Developer

---

