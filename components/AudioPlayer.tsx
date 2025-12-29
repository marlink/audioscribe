import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { AudioPlayerRef } from '../types';
import { formatSecondsToTime } from '../utils/timeUtils';

interface AudioPlayerProps {
  src: string;
  onTimeUpdate: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onEnded?: () => void;
}

/**
 * A wrapper around HTML5 Audio.
 * Uses forwardRef to give parent imperative control (seek/play).
 * Emits time updates to drive the application sync.
 * Includes advanced controls: Speed, Volume, Skip, Jump to Start/End.
 */
const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(({ src, onTimeUpdate, onDurationChange, onEnded }, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Local UI state
  const [isPlaying, setIsPlaying] = useState(false);
  const [internalTime, setInternalTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    play: async () => {
      if (audioRef.current) await audioRef.current.play();
    },
    pause: () => audioRef.current?.pause(),
    seek: (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
    },
    getCurrentTime: () => audioRef.current?.currentTime || 0
  }));

  // Sync Audio Properties
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      const t = audioRef.current.currentTime;
      setInternalTime(t);
      onTimeUpdate(t);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      setDuration(dur);
      if (onDurationChange) onDurationChange(dur);
    }
  };

  // Scrubber Interactions
  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setInternalTime(time);
  };

  const handleScrubberDown = () => setIsDragging(true);

  const handleScrubberUp = () => {
    setIsDragging(false);
    if (audioRef.current) {
      audioRef.current.currentTime = internalTime;
      onTimeUpdate(internalTime);
    }
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), duration);
  };

  const jumpToStart = () => {
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  const jumpToEnd = () => {
    if (audioRef.current) audioRef.current.currentTime = duration;
  };

  const cycleSpeed = () => {
    const speeds = [0.5, 1.0, 1.25, 1.5, 2.0];
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setPlaybackRate(speeds[nextIndex]);
  };

  return (
    <div className="bg-bg-surface rounded-lg border border-border-default p-4 shadow-sm w-full flex flex-col gap-3">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        preload="metadata"
        className="hidden"
      />

      {/* Scrubber - Full Width Top */}
      <div className="relative flex items-center group h-5 -mt-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={internalTime}
          onChange={handleScrubberChange}
          onMouseDown={handleScrubberDown}
          onTouchStart={handleScrubberDown}
          onMouseUp={handleScrubberUp}
          onTouchEnd={handleScrubberUp}
          className="absolute z-20 w-full h-full opacity-0 cursor-pointer"
          aria-label="Seek slider"
        />
        <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary rounded-full transition-all duration-75 ease-out"
            style={{ width: `${(internalTime / (duration || 1)) * 100}%` }}
          ></div>
        </div>
        <div
          className="absolute h-3 w-3 bg-brand-primary rounded-full shadow border border-bg-surface pointer-events-none transition-transform group-hover:scale-125"
          style={{ left: `calc(${(internalTime / (duration || 1)) * 100}% - 6px)` }}
        ></div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-y-2">
        {/* Speed & Volume */}
        <div className="flex items-center gap-2 flex-1 min-w-[100px]">
          <button
            onClick={cycleSpeed}
            className="text-xs font-bold text-text-secondary bg-bg-elevated hover:bg-brand-subtle hover:text-brand-primary px-2 py-1.5 rounded-md transition-colors w-12 text-center"
            title="Playback Speed"
          >
            {playbackRate}x
          </button>
          <div className="group relative flex items-center">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 text-text-muted hover:text-brand-primary rounded-md transition-colors"
            >
              {isMuted || volume === 0 ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
              )}
            </button>
            <div className="hidden group-hover:flex absolute bottom-full left-0 mb-2 p-2 bg-bg-elevated shadow-lg border border-border-default rounded-lg w-32 items-center gap-2 z-30">
              <input
                type="range" min="0" max="1" step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                className="w-full h-1 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-brand-primary"
              />
              <span className="text-xs font-mono text-text-muted w-8 text-right">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-2 justify-center flex-1 min-w-[200px]">
          <button onClick={jumpToStart} className="control-btn p-2" title="Jump to Beginning">
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => skip(-10)} className="control-btn p-2" title="Rewind 10s">
            <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg>
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 flex items-center justify-center bg-brand-primary text-white rounded-full hover:bg-brand-secondary shadow-lg shadow-brand-glow transition-all active:scale-95 transform mx-4 group relative"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <div className="absolute inset-0 rounded-full bg-brand-primary opacity-20 group-hover:animate-pulse"></div>
            {isPlaying ? (
              <svg className="h-6 w-6 relative z-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="h-6 w-6 translate-x-0.5 relative z-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
            )}
          </button>

          <button onClick={() => skip(10)} className="control-btn p-2" title="Forward 10s">
            <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          </button>
          <button onClick={jumpToEnd} className="control-btn p-2" title="Jump to End">
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Time */}
        <div className="flex-1 text-right min-w-[80px]">
          <div className="text-sm font-mono text-text-muted select-none">
            {formatSecondsToTime(internalTime)} / {formatSecondsToTime(duration)}
          </div>
        </div>
      </div>
      <style>{`
        .control-btn {
          @apply p-2 text-text-muted hover:text-brand-primary hover:bg-brand-subtle rounded-full transition-colors;
        }
      `}</style>
    </div>
  );
});

export default AudioPlayer;