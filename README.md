<h1 align="center">🔨 Interview Forge</h1>
<p align="center"><strong>Real-Time Technical Interview & Collaborative Coding Platform</strong></p>

<p align="center">
  <a href="https://interview-forge-td0y.onrender.com"><strong>🔴 Live Demo: https://interview-forge-td0y.onrender.com</strong></a>
</p>

---

## 📖 Overview

**Interview Forge** is a full-stack MERN web application designed to facilitate seamless, real-time technical interviews and collaborative coding sessions. Built with a focus on high performance and real-time synchronization, the platform enables interviewers and candidates to write, debug, and execute code together within a fully integrated VS Code-style editor. 

This project aims to simulate a professional coding environment, providing tools for instant test-case evaluation, real-time video/audio communication, and comprehensive session management to support up to 100+ simultaneous users with high uptime reliability.

## ✨ Core Features

- **🧑‍💻 Collaborative Code Editor**: A highly responsive, Monaco-based (VS Code) editor with syntax highlighting and multi-language support.
- **⚙️ Secure Code Execution**: Isolated, remote code execution for evaluating candidate algorithms against custom test cases in real-time.
- **🎥 Integrated A/V Communication**: 1-on-1 video and audio rooms built directly into the interview interface, complete with screen sharing and recording via Stream SDK.
- **🔐 Secure Authentication**: Handled via Clerk, providing role-based access for Interviewers and Candidates.
- **💬 Real-Time Chat**: Integrated chat messaging alongside the coding workspace.
- **🧩 Practice Mode**: A dedicated solo coding environment for candidates to practice algorithms.
- **🔒 Session Control**: Secure room locking to ensure private 1-on-1 sessions.
- **🧠 Background Task Management**: Async workflows powered by Inngest for scalable data synchronization.

## 🛠️ Technology Stack

**Frontend:**
- React.js (Vite)
- TailwindCSS & DaisyUI
- Zustand (State Management)
- TanStack Query (Data Fetching & Caching)

**Backend:**
- Node.js & Express.js (RESTful APIs)
- MongoDB & Mongoose (Data Persistence & Modeling)
- Inngest (Background Jobs)
- Stream SDK (Video & Chat Sync)

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account

### 1. Environment Variables Setup

Create a `.env` file in both the `/backend` and `/frontend` directories.

**Backend (`/backend/.env`)**
```env
PORT=3000
NODE_ENV=development
DB_URL=your_mongodb_connection_url
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLIENT_URL=http://localhost:5173
```

**Frontend (`/frontend/.env`)**
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000/api
VITE_STREAM_API_KEY=your_stream_api_key
```

### 2. Installation & Running

From the root directory, install all dependencies and start the development servers:

```bash
# Install backend and frontend dependencies
npm install --prefix backend
npm install --prefix frontend

# Start the Backend (Port 3000)
npm run start --prefix backend

# In a separate terminal, start the Frontend (Port 5173)
npm run dev --prefix frontend
```

---
*Developed with a focus on scalable RESTful architecture, OOP principles in Node.js, and best engineering practices.*
