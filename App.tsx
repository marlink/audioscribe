import React, { useState, useRef, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FileUploader from './components/FileUploader';
import TranscriptList from './components/TranscriptList';
import AudioPlayer from './components/AudioPlayer';
import ProgressIndicator from './components/ProgressIndicator';
import { TranscriptionStatus, TranscriptionResult, AudioFile, ProgressState, AudioPlayerRef } from './types';
import { transcribeAudio } from './services/geminiService';
import { formatFileSize } from './utils/fileUtils';
import { parseTimestampToSeconds } from './utils/timeUtils';

interface ErrorState {
  title: string;
  message: string;
}

const App: React.FC = () => {
  // State Machine
  const [status, setStatus] = useState<TranscriptionStatus>(TranscriptionStatus.IDLE);
  const [error, setError] = useState<ErrorState | null>(null);

  // Data
  const [currentFile, setCurrentFile] = useState<AudioFile | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [progress, setProgress] = useState<ProgressState>({ stage: 'Idle', percent: 0 });

  // Sync
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef<AudioPlayerRef>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (currentFile?.previewUrl) URL.revokeObjectURL(currentFile.previewUrl);

    setCurrentFile({
      file,
      previewUrl: URL.createObjectURL(file)
    });

    // Reset State
    setStatus(TranscriptionStatus.IDLE);
    setResult(null);
    setError(null);
    setCurrentTime(0);
  }, [currentFile]);

  const handleTranscribe = async () => {
    if (!currentFile) return;

    setStatus(TranscriptionStatus.UPLOADING);
    setError(null);

    try {
      const rawResult = await transcribeAudio(
        currentFile.file,
        (stage, percent) => {
          setProgress({ stage, percent });
          // Transition state logic
          if (stage !== 'Upload' && status === TranscriptionStatus.UPLOADING) {
            setStatus(TranscriptionStatus.PROCESSING);
          }
        }
      );

      // Transform Data immediately for Performance
      // Pre-calc seconds so we don't do it in the render loop
      const optimizedSegments = rawResult.segments.map(seg => ({
        ...seg,
        startSeconds: parseTimestampToSeconds(seg.timestamp),
        endSeconds: undefined // Let list infer end from next segment
      }));

      setResult({ ...rawResult, segments: optimizedSegments });
      setStatus(TranscriptionStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError({
        title: "Transcription Failed",
        message: err.message || "An unexpected error occurred."
      });
      setStatus(TranscriptionStatus.ERROR);
    }
  };

  const handleSeek = useCallback((time: number) => {
    playerRef.current?.seek(time);
    playerRef.current?.play(); // Auto-play on seek improves UX
  }, []);

  const handleReset = () => {
    if (currentFile?.previewUrl) URL.revokeObjectURL(currentFile.previewUrl);
    setCurrentFile(null);
    setResult(null);
    setStatus(TranscriptionStatus.IDLE);
    setProgress({ stage: 'Idle', percent: 0 });
  };

  const isBusy = status === TranscriptionStatus.UPLOADING || status === TranscriptionStatus.PROCESSING;

  return (
    <div className="flex flex-col h-screen font-sans text-text-primary bg-page-gradient transition-colors duration-500">
      <Header />

      <main className="flex-1 w-full max-w-full mx-auto px-4 sm:px-10 py-6 flex flex-col lg:flex-row gap-8 overflow-hidden">

        {/* Left Panel: Input & Controls */}
        <div className={`flex flex-col gap-6 w-full lg:w-1/3 transition-all duration-300 ${result ? '' : 'lg:w-1/2 lg:mx-auto'}`}>
          <div className="premium-card p-8 flex flex-col gap-6 bg-bg-surface border-border-subtle">
            <h2 className="text-lg font-bold flex items-center gap-2 text-text-primary">
              <span className="w-1.5 h-6 bg-brand-primary rounded-full shadow-[0_0_10px_var(--accent-glow)]"></span>
              Audio Source
            </h2>

            {!currentFile ? (
              <FileUploader onFileSelect={handleFileSelect} disabled={isBusy} />
            ) : (
              <div className="animate-fade-in flex flex-col gap-6">
                <div className="flex items-center justify-between p-4 bg-bg-accent rounded-lg border border-border">
                  <div className="min-w-0">
                    <p className="font-semibold truncate text-text-primary">{currentFile.file.name}</p>
                    <p className="text-xs text-text-muted">{formatFileSize(currentFile.file.size)}</p>
                  </div>
                  <button
                    onClick={handleReset}
                    disabled={isBusy}
                    className="flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-status-error px-2 py-1 rounded hover:bg-status-error-bg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Start Over
                  </button>
                </div>

                <AudioPlayer
                  ref={playerRef}
                  src={currentFile.previewUrl}
                  onTimeUpdate={setCurrentTime}
                />

                {!isBusy && !result && (
                  <button
                    onClick={handleTranscribe}
                    className="w-full py-4 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg font-bold shadow-lg shadow-brand-glow transition-all active-scale-95 transform"
                  >
                    Start Transcription
                  </button>
                )}
              </div>
            )}

            {isBusy && (
              <ProgressIndicator
                stage={progress.stage}
                percent={progress.percent}
                isUploading={status === TranscriptionStatus.UPLOADING}
              />
            )}

            {error && (
              <div className="p-4 bg-status-error-bg border border-status-error/30 rounded-lg text-sm text-status-error">
                <p className="font-bold">{error.title}</p>
                <p>{error.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Output */}
        {status === TranscriptionStatus.SUCCESS && result ? (
          <div className="flex-1 h-full lg:h-auto animate-fade-in-right">
            <TranscriptList
              segments={result.segments}
              fileName={result.fileName}
              language={result.language}
              currentTime={currentTime}
              onSeek={handleSeek}
            />
          </div>
        ) : (
          !currentFile && (
            <div className="hidden lg:flex flex-1 items-center justify-center bg-bg-surface/30 rounded-lg border border-dashed border-border-subtle">
              <p className="text-text-muted font-medium">Upload audio to begin</p>
            </div>
          )
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;