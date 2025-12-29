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
   
   Create or edit `.env.local` in the project root:
   ```bash
   # Add your API key here if using external transcription services
   API_KEY=your_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:3000`

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## Project Structure

```
audioscribe-ai/
├── components/          # React components
│   ├── AudioPlayer.tsx
│   ├── FileUploader.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── ProgressIndicator.tsx
│   ├── TranscriptList.tsx
│   └── TranscriptionDisplay.tsx
├── services/           # API and business logic
│   └── transcriptionService.ts
├── utils/             # Utility functions
├── App.tsx            # Main application component
├── index.tsx          # Application entry point
├── types.ts           # TypeScript type definitions
├── styles.css         # Global styles
└── vite.config.ts     # Vite configuration

```

## Environment Variables

- `API_KEY`: API key for transcription service (required)

## Features

- Upload audio files in multiple formats (MP3, M4A, WAV)
- Real-time transcription progress tracking
- Timestamped transcript segments
- Speaker detection (when available)
- Audio playback with synchronized transcript
- Export transcripts
- Responsive design for mobile and desktop

## Development

The project uses:
- **TypeScript** for type safety
- **Vite** for fast development and optimized builds
- **React 19** with modern hooks and patterns
- **Tailwind CSS** for utility-first styling

## Troubleshooting

- **Port already in use**: Change the port in `vite.config.ts` (default: 3000)
- **API errors**: Verify your API key is correctly set in `.env.local`
- **Build errors**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## License

All rights reserved.
