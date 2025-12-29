# AudioScribe AI

A self-contained audio transcription application that runs locally on your machine.

## Project Purpose

AudioScribe AI is a React-based web application that transcribes audio files (MP3, M4A, WAV) into text with timestamps and speaker detection. The application processes audio files entirely on your local machine.

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS
- **Runtime**: Node.js

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Create or edit `.env` in the project root:
   ```bash
   # Add your Google Gemini API key here
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the application (Server + Client):**
   ```bash
   npm start
   ```
   
   The application will be available at `http://localhost:3000`
   This command starts the local Express server which handles both the API and serving the frontend.

4. **Development Mode (Frontend Only):**
   ```bash
   npm run dev
   ```
   *Note: API calls will fail in this mode unless a backend is running separately.*

## Project Structure

```
audioscribe-ai/
├── components/          # React components
│   ├── AudioPlayer.tsx
│   ├── FileUploader.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── ProgressIndicator.tsx
│   └── TranscriptList.tsx
├── services/           # API and business logic
│   └── geminiService.ts
├── utils/             # Utility functions
├── App.tsx            # Main application component
├── server.js          # Express backend server
├── styles.css         # Global styles and Design System
└── vite.config.ts     # Vite configuration
```

## Environment Variables

- `GEMINI_API_KEY`: API key for Google Gemini AI service (required for transcription)

## Features

- **Local Processing Pipeline**: Frontend-to-Backend secure communication
- **AI Transcription**: Powered by Google Gemini 1.5 Flash
- Upload audio files in multiple formats (MP3, M4A, WAV)
- Real-time transcription progress tracking
- Timestamped transcript segments
- Speaker detection and formatting
- Audio playback with synchronized transcript
- Premium UI with Dark Mode support

## Troubleshooting

- **Transcription Failed**: Ensure `npm start` is running and `GEMINI_API_KEY` is set in `.env`
- **Port already in use**: Change the port in `server.js` or `vite.config.ts`
- **API errors**: Check server logs in the terminal where you ran `npm start`

## License

All rights reserved.
