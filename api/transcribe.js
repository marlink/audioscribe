
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
    maxDuration: 60,
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { base64Data, mimeType } = req.body;

    if (!base64Data) {
        return res.status(400).json({ error: 'No audio data provided' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        // Using gemini-1.5-flash as it's the stable reliable model for this
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

        const response = await ai.models.generateContent({
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

        if (!response.text) {
            throw new Error("Empty response from AI model.");
        }

        const json = JSON.parse(response.text);
        return res.status(200).json(json);

    } catch (error) {
        console.error("Gemini API Error:", error);
        return res.status(500).json({
            error: "Transcription failed",
            details: error.message
        });
    }
}
