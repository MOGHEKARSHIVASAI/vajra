import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeminiModel = (apiKey) => {
  if (!apiKey) return null;
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export const testApiKey = async (apiKey) => {
  const model = getGeminiModel(apiKey);
  if (!model) return false;
  try {
    await model.generateContent("test");
    return true;
  } catch (error) {
    console.error("API Key Test Failed:", error);
    return false;
  }
};

export const getDailyBrief = async (apiKey, userData, yesterdayStats) => {
  const model = getGeminiModel(apiKey);
  if (!model) return "Please add your Gemini API key in Profile to enable AI insights.";

  const prompt = `
    User: ${userData.name}, Goal: ${userData.goals.targetWeight}kg.
    Yesterday's stats: ${JSON.stringify(yesterdayStats)}.
    Return a 2-sentence motivational daily brief with one specific insight based on yesterday's data.
    Be concise and professional.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Keep up the great work today! Every step counts towards your goals.";
  }
};

export const getWorkoutSuggestion = async (apiKey, userData, recentWorkouts, muscleFrequency) => {
  const model = getGeminiModel(apiKey);
  if (!model) return null;

  const prompt = `
    Based on user's fitness level, goals, last 7 days of workouts, and which 
    muscle groups haven't been trained recently, suggest a specific workout plan for 
    today.
    Recent: ${JSON.stringify(recentWorkouts)}
    Frequency: ${JSON.stringify(muscleFrequency)}
    Return JSON format: { "name": "...", "exercises": [{ "name": "...", "sets": 3, "reps": "8-12", "rest": 90 }] }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Clean JSON if needed
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (error) {
    return null;
  }
};

export const getMealSuggestions = async (apiKey, userGoals, todayNutrition, preferences) => {
  const model = getGeminiModel(apiKey);
  if (!model) return null;

  const prompt = `
    User needs more calories and protein today.
    Current: ${JSON.stringify(todayNutrition)}
    Goals: ${JSON.stringify(userGoals)}
    Suggest 3 realistic meals with full macro breakdown.
    Return JSON array of objects.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.match(/\[[\s\S]*\]/)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (error) {
    return null;
  }
};

export const getWeeklySummary = async (apiKey, weekData) => {
  const model = getGeminiModel(apiKey);
  if (!model) return null;

  const prompt = `
    Analyze this week's data: ${JSON.stringify(weekData)}.
    Return a structured summary: achievements, areas to improve, one specific recommendation.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return null;
  }
};

export const getSmartAlerts = async (apiKey, todayData, userGoals) => {
  const model = getGeminiModel(apiKey);
  if (!model) return [];

  const prompt = `
    Check if user is low on protein, hasn't logged a workout, is under-hydrated, or missed sleep goals.
    Today: ${JSON.stringify(todayData)}
    Goals: ${JSON.stringify(userGoals)}
    Return relevant nudge alerts as JSON array of strings.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.match(/\[[\s\S]*\]/)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (error) {
    return [];
  }
};

export const getSleepTip = async (apiKey, recentSleepData) => {
  const model = getGeminiModel(apiKey);
  if (!model) return null;

  const prompt = `
    Based on average sleep: ${JSON.stringify(recentSleepData)}, 
    give one specific, actionable sleep improvement tip.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return null;
  }
};
