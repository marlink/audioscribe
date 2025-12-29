/**
 * Enums for the application state machine.
 */
export enum TranscriptionStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

/**
 * Represents a single line in the transcript.
 * startSeconds/endSeconds are pre-parsed for O(1) rendering logic.
 */
export interface TranscriptionSegment {
  timestamp: string;     // Display string "MM:SS"
  text: string;          // Content
  speaker?: string;      // Optional speaker label
  startSeconds: number;  // Parsed for sync
  endSeconds?: number;   // Optional end for strict duration highlighting
}

/**
 * The full result object from the backend.
 */
export interface TranscriptionResult {
  segments: TranscriptionSegment[];
  fileName: string;
  language?: string; // Detected language
  processedAt: Date;
}

/**
 * Represents the audio file loaded into the app.
 */
export interface AudioFile {
  file: File;
  previewUrl: string; // Blob URL for local playback
}

/**
 * Granular progress tracking for UI feedback.
 */
export interface ProgressState {
  stage: 'Upload' | 'Analyze' | 'Transcribe' | 'Format' | 'Idle';
  percent: number;
}

/**
 * Handle for the AudioPlayer component to expose imperative controls.
 */
export interface AudioPlayerRef {
  play: () => Promise<void>;
  pause: () => void;
  seek: (seconds: number) => void;
  getCurrentTime: () => number;
}

export const ALLOWED_MIME_TYPES = [
  'audio/mpeg', 'audio/mp3', 
  'audio/wav', 'audio/x-wav', 
  'audio/mp4', 'audio/x-m4a', 'audio/aac'
];