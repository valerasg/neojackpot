/**
 * geminiService.ts
 * Proxies the request to our secure backend to keep the API key hidden.
 */

// In production, this would be an environment variable pointing to your deployed backend
const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-deployed-backend.com' // Replace with Render/Railway URL later
  : 'http://localhost:3001';

export const generateWinLog = async (amount: number, symbolName: string): Promise<string> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/generate-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Note: The backend expects 'winAmount' and 'symbol' based on the newly created express route
      body: JSON.stringify({ winAmount: amount, symbol: symbolName }),
    });

    if (!response.ok) {
      throw new Error(`Backend error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.log;
  } catch (error) {
    console.warn('Backend proxy failed. Falling back to offline message.', error);
    // Fallback UI message if the backend is down
    return `SYSTEM_ALERT: HACK_SUCCESSFUL // CREDITS_TRANSFERRED: ${amount} (OFFLINE_MODE)`;
  }
};