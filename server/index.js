import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load .env file from the parent directory (or local if deployed)
dotenv.config({ path: '../.env' });
// Fallback in case it's deployed and .env is in the same folder
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Use the API key from the environment
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("WARNING: No API_KEY or GEMINI_API_KEY found in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

app.use(cors());
app.use(express.json());

app.post('/api/generate-log', async (req, res) => {
    try {
        const { winAmount, symbol } = req.body;

        if (!winAmount || !symbol) {
            return res.status(400).json({ error: 'Missing winAmount or symbol in request body' });
        }

        const prompt = `You are the core AI of a cyberpunk slot machine. the user has just hacked into the system and won a jackpot. The spin resulted in a combination of ${symbol}s. The total extraction is ${winAmount} credits. Provide a short, cryptic, and robotic message (max 2 sentences) congratulating the hacker and acknowledging the extraction. Use words like 'breach', 'credits', 'system', 'extraction'. Start the message directly, no greetings.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const aiLog = response.text || `SYSTEM BREACH DETECTED. EXTRACTION OF ${winAmount} CREDITS SUCCESSFUL.`;
        res.json({ log: aiLog });

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        // Fallback message if the API fails
        res.status(500).json({ log: `SYSTEM BREACH DETECTED. EXTRACTION OF ${req.body.winAmount} CREDITS SUCCESSFUL (OFFLINE MODE).` });
    }
});

app.listen(port, () => {
    console.log(`NeonJackpot Secure Backend listening on port ${port}`);
});
