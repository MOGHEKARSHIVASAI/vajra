import { useState } from 'react';
import { useStore } from '../store/useStore';
import * as gemini from '../services/gemini';

export const useAI = () => {
  const profile = useStore((state) => state.profile);
  const { updateAiCache, getCachedAiResponse } = useStore();
  const [loading, setLoading] = useState(false);
  const apiKey = profile?.settings?.geminiApiKey;

  const getDailyBrief = async (yesterdayStats) => {
    const cacheKey = `dailyBrief_${new Date().toDateString()}`;
    const cached = getCachedAiResponse(cacheKey);
    if (cached) return cached;

    setLoading(true);
    const result = await gemini.getDailyBrief(apiKey, profile, yesterdayStats);
    updateAiCache(cacheKey, result);
    setLoading(false);
    return result;
  };

  const getWorkoutSuggestion = async (recentWorkouts, muscleFrequency) => {
    setLoading(true);
    const result = await gemini.getWorkoutSuggestion(apiKey, profile, recentWorkouts, muscleFrequency);
    setLoading(false);
    return result;
  };

  const getMealSuggestions = async (todayNutrition, preferences) => {
    setLoading(true);
    const result = await gemini.getMealSuggestions(apiKey, profile?.goals, todayNutrition, preferences);
    setLoading(false);
    return result;
  };

  return { loading, getDailyBrief, getWorkoutSuggestion, getMealSuggestions };
};
