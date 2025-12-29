/**
 * Parses a "HH:MM:SS" or "MM:SS" string into total seconds.
 * Robust against varying segment formats.
 */
export const parseTimestampToSeconds = (timestamp: string): number => {
  if (!timestamp) return 0;
  
  const parts = timestamp.split(':').map(part => parseFloat(part));
  
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
};

/**
 * Formats seconds into MM:SS or HH:MM:SS for display.
 */
export const formatSecondsToTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  const mStr = m.toString().padStart(2, '0');
  const sStr = s.toString().padStart(2, '0');
  
  if (h > 0) {
    return `${h}:${mStr}:${sStr}`;
  }
  return `${mStr}:${sStr}`;
};
