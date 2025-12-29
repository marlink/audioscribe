import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, Type } from "@google/genai";
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
// Increase limit for base64 audio uploads
app.use(express.json({ limit: '50mb' }));

// API Route for Transcription
app.post('/api/transcribe', async (req, res) => {
    try {
        const { base64Data, mimeType } = req.body;

        if (!base64Data) {
            return res.status(400).json({ error: 'No audio data provided' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Missing GEMINI_API_KEY");
            return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
        }

        const ai = new GoogleGenAI({ apiKey });
        const model = 'gemini-1.5-flash';

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                language: { type: Type.STRING },
                segments: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            timestamp: { type: Type.STRING },
                            text: { type: Type.STRING },
                            speaker: { type: Type.STRING }
                        },
                        required: ["timestamp", "text"]
                    }
                }
            },
            required: ["language", "segments"]
        };

        const result = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType || 'audio/mp3',
                            data: base64Data
                        }
                    },
                    {
                        text: `Transcribe this audio file. 
                   Detect the primary language.
                   Format the output strictly as JSON with a 'segments' array and a 'language' field.
                   Each segment must have a 'timestamp' (MM:SS) and 'text'.`
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });

        const response = result.response;
        if (!response.text()) {
            throw new Error("Empty response from AI model.");
        }

        const json = JSON.parse(response.text());
        res.status(200).json(json);

    } catch (error) {
        console.error("Server Transcription Error:", error);
        res.status(500).json({
            error: "Transcription failed",
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// Serve Static Files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback: For any other route, serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API endpoint available at http://localhost:${PORT}/api/transcribe`);
});
