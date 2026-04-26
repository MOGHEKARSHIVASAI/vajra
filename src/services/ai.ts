import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = (apiKey?: string) => {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  return key ? new GoogleGenerativeAI(key) : null;
};

export const getGeminiResponse = async (prompt: string, history: { role: "user" | "model"; parts: { text: string }[] }[] = [], apiKey?: string) => {
  const ai = genAI(apiKey);
  if (!ai) {
    throw new Error("Gemini API key is missing. Please add it in Settings -> AI Configuration.");
  }

  try {
    const model = ai.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are VAJRA AI, a professional fitness and nutrition coach. You have access to the user's training volume, nutrition logs, and biometric data. Your tone is motivating, scientific, and concise. Always provide actionable advice based on gym progress." }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am VAJRA AI, your elite performance coach. I will analyze your data and provide precise, actionable guidance to optimize your training and recovery." }],
        },
        ...history
      ],
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to get AI response");
  }
};
