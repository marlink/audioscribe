import { TranscriptionResult } from "../types";

export type ProgressCallback = (stage: 'Upload' | 'Analyze' | 'Transcribe' | 'Format', percent: number) => void;

/**
 * Generic transcription service that can be adapted to any transcription API.
 * Currently configured as a placeholder - replace with your preferred transcription service.
 */
export const uploadAndTranscribe = async (
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

    // TODO: Replace with your transcription API endpoint
    const API_ENDPOINT = process.env.API_ENDPOINT || 'https://api.example.com/transcribe';
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
        throw new Error("API_KEY not configured. Please set API_KEY in .env.local");
    }

    // 3. Call API
    onProgress('Transcribe', 0);

    // Simulate "Thinking" progress.
    // We use a decaying increment so it starts briskly but slows down as it approaches 99%.
    // This prevents the "stuck at 95%" feeling while accommodating variable API latency.
    let simProgress = 0;
    const progressInterval = setInterval(() => {
        const remaining = 99 - simProgress;
        // Move ~5% of the remaining distance per tick, plus a little random jitter for realism
        const increment = (remaining * 0.05) + (Math.random() * 0.5);
        simProgress = Math.min(simProgress + increment, 99);
        onProgress('Transcribe', Math.floor(simProgress));
    }, 800);

    try {
        // Example API call structure - adapt to your transcription service
        const formData = new FormData();
        formData.append('file', file);
        formData.append('language', 'auto'); // Auto-detect language
        formData.append('format', 'json');

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                // Note: Don't set Content-Type for FormData, browser will set it with boundary
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error (${response.status}): ${errorText}`);
        }

        const json = await response.json();

        clearInterval(progressInterval);

        // Jump to 100% Transcribe before formatting
        onProgress('Transcribe', 100);

        // Slight delay to let UI show 100% Transcribe before switching to Format
        await new Promise(r => setTimeout(r, 200));

        onProgress('Format', 50);

        // Parse response - adapt this to match your API's response format
        const segments = parseTranscriptionResponse(json);

        onProgress('Format', 100);

        // Short delay to allow user to see "Formatting 100%"
        await new Promise(r => setTimeout(r, 400));

        return {
            segments: segments,
            fileName: file.name,
            language: json.language || "Unknown",
            processedAt: new Date()
        };

    } catch (error: any) {
        clearInterval(progressInterval);
        console.error("Transcription API Error:", error);
        let errorMsg = error.message || "Failed to transcribe audio.";
        if (errorMsg.includes("400")) errorMsg += " (Bad Request - Check file format/size)";
        if (errorMsg.includes("403")) errorMsg += " (API Key Invalid)";
        if (errorMsg.includes("401")) errorMsg += " (Unauthorized - Check API Key)";
        throw new Error(errorMsg);
    }
};

/**
 * Parse transcription response from API.
 * Adapt this function to match your API's response format.
 */
function parseTranscriptionResponse(json: any): Array<{ timestamp: string, text: string, speaker?: string }> {
    // Example parsing - modify based on your API's response structure
    if (json.segments && Array.isArray(json.segments)) {
        return json.segments.map((seg: any) => ({
            timestamp: seg.timestamp || seg.start_time || "00:00",
            text: seg.text || "",
            speaker: seg.speaker || undefined
        }));
    }

    // Fallback: if API returns plain text, create a single segment
    if (json.text || json.transcription) {
        return [{
            timestamp: "00:00",
            text: json.text || json.transcription,
            speaker: undefined
        }];
    }

    // If no recognizable format, return empty
    return [];
}

/**
 * Helper to read file as Base64 string (stripping the data URL prefix).
 */
const readFileAsBase64 = (file: File, onProgress: (percent: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result as string;
            // result is "data:audio/mp3;base64,...." -> we need the part after comma
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
