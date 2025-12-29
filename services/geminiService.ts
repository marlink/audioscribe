
import { TranscriptionResult } from "../types";

export type ProgressCallback = (stage: 'Upload' | 'Analyze' | 'Transcribe' | 'Format', percent: number) => void;

/**
 * Uploads file to internal Vercel API and requests transcription.
 * This ensures the API Key is never exposed to the client.
 */
export const transcribeAudio = async (
  file: File,
  onProgress: ProgressCallback
): Promise<TranscriptionResult> => {

  // 1. Read File (Simulate Upload Stage)
  onProgress('Upload', 10);
  const base64Data = await readFileAsBase64(file, (percent) => {
    onProgress('Upload', Math.floor(percent));
  });
  onProgress('Upload', 100);

  // 2. Prepare Request
  onProgress('Analyze', 0);

  // 3. Call API
  onProgress('Transcribe', 0);

  // Simulate "Thinking" progress while waiting for backend
  let simProgress = 0;
  const progressInterval = setInterval(() => {
    const remaining = 99 - simProgress;
    const increment = (remaining * 0.05) + (Math.random() * 0.5);
    simProgress = Math.min(simProgress + increment, 99);
    onProgress('Transcribe', Math.floor(simProgress));
  }, 800);

  try {
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Data,
        mimeType: file.type || 'audio/mp3',
        fileName: file.name
      })
    });

    clearInterval(progressInterval);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }

    onProgress('Transcribe', 100);
    await new Promise(r => setTimeout(r, 200));
    onProgress('Format', 50);

    const json = await response.json();

    onProgress('Format', 100);
    await new Promise(r => setTimeout(r, 400));

    return {
      segments: json.segments || [],
      fileName: file.name,
      language: json.language || "Unknown",
      processedAt: new Date()
    };

  } catch (error: any) {
    clearInterval(progressInterval);
    console.error("Transcription Error:", error);
    throw new Error(error.message || "Failed to transcribe audio.");
  }
};

/**
 * Helper to read file as Base64 string (stripping the data URL prefix).
 */
const readFileAsBase64 = (file: File, onProgress: (percent: number) => void): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      if (!base64) reject(new Error("Failed to encode file"));
      resolve(base64);
    };

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress((e.loaded / e.total) * 100);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));

    reader.readAsDataURL(file);
  });
};
