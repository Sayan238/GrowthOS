# GrowthOS - Become Better Every Day

GrowthOS is a modern, AI-powered self-development assistant designed for students and creators.

## Features
- **AI Chatbot (Coach Aurora)**: Integrated with Gemini API for suggestions and motivation.
- **Smart Planner**: Drag-and-drop daily schedule blocks.
- **Habit Tracker**: Streak-based consistency mapping.
- **Analytics**: Deep insights into growth % and productivity.
- **Time Waste Tracker**: Calculate wasted hours and find productive replacements.
- **Gamification**: XP points, levels, and "Beast Mode" streaks.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, Dnd-kit.
- **Backend**: Node.js, Express, Gemini AI (Google Generative AI).

## Setup Instructions

### 1. Backend Setup
1. Open a terminal in `backend/`.
2. Create a `.env` file:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Install dependencies: `npm install`
4. Start the server: `node index.js` (or `npm run dev` if you add nodemon).

### 2. Frontend Setup
1. Open a terminal in `frontend/`.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open `http://localhost:5173` in your browser.

## AI Integration
To enable the AI Coach, get your free **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/) and add it to the backend `.env` file.
