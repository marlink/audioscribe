
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadAndTranscribe } from './transcriptionService';

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('transcriptionService', () => {
    // Mock FileReader
    let originalFileReader: any;

    beforeEach(() => {
        // Set default env vars for tests
        vi.stubEnv('API_KEY', 'test-api-key');
        vi.stubEnv('API_ENDPOINT', 'https://api.test.com/transcribe');

        originalFileReader = global.FileReader;
        // Basic Mock for FileReader
        global.FileReader = class {
            onload: any;
            onerror: any;
            onprogress: any;
            readAsDataURL() {
                // Simulate success immediately
                setTimeout(() => {
                    // The service expects "data:audio/mp3;base64,DATA"
                    this.result = "data:audio/mp3;base64,ZmFrZWF1ZGlv"; // "fakeaudio" in base64
                    if (this.onload) this.onload();
                }, 10);
            }
            result: string = "";
        } as any;

        fetchMock.mockReset();
    });

    afterEach(() => {
        global.FileReader = originalFileReader;
        vi.unstubAllEnvs();
    });

    it('should successfully upload and transcribe a file', async () => {
        // Mock successful API response
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                language: 'en',
                segments: [
                    { timestamp: '00:00', text: 'Hello world', speaker: 'Speaker 1' }
                ]
            })
        });

        const file = new File(['fake content'], 'test.mp3', { type: 'audio/mp3' });
        const onProgress = vi.fn();

        const result = await uploadAndTranscribe(file, onProgress);

        // Verify API call
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe('https://api.test.com/transcribe');
        expect(options.method).toBe('POST');
        expect(options.headers['Authorization']).toBe('Bearer test-api-key');

        // Verify result
        expect(result.fileName).toBe('test.mp3');
        expect(result.language).toBe('en');
        expect(result.segments).toHaveLength(1);
        expect(result.segments[0].text).toBe('Hello world');

        // Verify progress callbacks (at least some key stages)
        expect(onProgress).toHaveBeenCalledWith('Upload', expect.any(Number));
        expect(onProgress).toHaveBeenCalledWith('Analyze', 0);
        expect(onProgress).toHaveBeenCalledWith('Transcribe', 0);
        expect(onProgress).toHaveBeenCalledWith('Format', 100);
    });

    it('should handle API errors correctly', async () => {
        // Mock API error response
        fetchMock.mockResolvedValueOnce({
            ok: false,
            status: 401,
            text: async () => 'Unauthorized'
        });

        const file = new File(['fake content'], 'test.mp3', { type: 'audio/mp3' });
        const onProgress = vi.fn();

        await expect(uploadAndTranscribe(file, onProgress)).rejects.toThrow('API Error (401): Unauthorized');
    });

    it('should throw error if API_KEY is missing', async () => {
        vi.stubEnv('API_KEY', ''); // Clear API Key

        const file = new File(['fake content'], 'test.mp3', { type: 'audio/mp3' });
        const onProgress = vi.fn();

        // Should fail before calling fetch
        await expect(uploadAndTranscribe(file, onProgress)).rejects.toThrow('API_KEY not configured');
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
