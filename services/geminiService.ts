import { GoogleGenAI } from "@google/genai";

// Initialize the API client
// Note: In a real production app, usage of process.env would require a build step setup.
// We assume the environment variable is provided.
const apiKey = process.env.API_KEY || '';

export const generateWinLog = async (amount: number, symbolName: string): Promise<string> => {
  if (!apiKey) return "SYSTEM MESSAGE: Connection to AI Mainframe lost (Missing API Key).";

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are a cyberpunk hacker system. The user just hacked a slot machine mainframe.
      Win Amount: ${amount} credits.
      Symbol Matched: ${symbolName}.
      
      Write a very short, cool, 1-sentence system log message about this hack. 
      Use technical jargon (ICE, firewall, breach, crypto, node). 
      Do not use hashtags. 
      Style: Terminal log.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 50,
      }
    });

    return response.text?.trim() || "SYSTEM OVERRIDE SUCCESSFUL.";
  } catch (error) {
    console.error("Gemini generation failed", error);
    return `SYSTEM_ALERT: HACK_SUCCESSFUL // CREDITS_TRANSFERRED: ${amount}`;
  }
};