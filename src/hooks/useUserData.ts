import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/services/firebase";
import { db } from "@/services/firestore";
import {
  collection, query, where, limit, getDocs,
  doc, getDoc, setDoc, onSnapshot, orderBy
} from "firebase/firestore";

export interface UserProfile {
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  goals?: { calories?: number; water?: number; protein?: number };
  gamification?: {
    xp: number;
    level: number;
    streak: number;
    longestStreak: number;
    lastWorkoutDate: string | null;
  };
}

export interface WorkoutLog {
  id: string;
  name?: string;
  date?: string;
  exercises?: any[];
  totalVolume?: number;
  duration?: number;
  createdAt?: any;
}

export interface NutritionLog {
  id: string;
  date: string;
  meals?: any[];
  totals?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface WaterLog {
  id: string;
  date: string;
  total_ml: number;
  entries?: any[];
}

export interface WeightLog {
  id: string;
  weight: number;
  bodyFat?: number;
  neck?: number;
  waist?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  date: string;
  createdAt?: any;
}

export interface UserData {
  user: User | null;
  profile: UserProfile | null;
  recentWorkouts: WorkoutLog[];
  todayNutrition: NutritionLog | null;
  weekNutrition: NutritionLog[];
  todayWater: WaterLog | null;
  weekWater: WaterLog[];
  weightHistory: WeightLog[];
  calendarEvents: any[];
  sleepLogs: any[];
  progressPhotos: any[];
  vaultPin: string | null;
  loading: boolean;
  error: string | null;
}

const todayStr = () => new Date().toISOString().split("T")[0];

export function useUserData(): UserData {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutLog[]>([]);
  const [todayNutrition, setTodayNutrition] = useState<NutritionLog | null>(null);
  const [weekNutrition, setWeekNutrition] = useState<NutritionLog[]>([]);
  const [todayWater, setTodayWater] = useState<WaterLog | null>(null);
  const [weekWater, setWeekWater] = useState<WaterLog[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightLog[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [sleepLogs, setSleepLogs] = useState<any[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<any[]>([]);
  const [vaultPin, setVaultPin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setError("Firebase not configured");
      return;
    }

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setRecentWorkouts([]);
        setTodayNutrition(null);
        setWeekNutrition([]);
        setTodayWater(null);
        setWeekWater([]);
        setWeightHistory([]);
        setCalendarEvents([]);
        setSleepLogs([]);
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user || !db) return;

    setLoading(true);
    const today = todayStr();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

    // 1. Profile Listener
    const unsubProfile = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data as UserProfile);
        setVaultPin(data.vaultPin ?? null);
      } else {
        const newProfile: UserProfile = {
          name: user.displayName ?? user.email?.split("@")[0] ?? "User",
          gamification: { xp: 0, level: 1, streak: 0, longestStreak: 0, lastWorkoutDate: null },
          goals: { calories: 2500, water: 3000, protein: 170 },
        };
        setDoc(doc(db, "users", user.uid), { ...newProfile, createdAt: new Date().toISOString() });
        setProfile(newProfile);
      }
    });

    // 2. Workouts Listener
    const workoutsQ = query(
      collection(db, "workouts"),
      where("userId", "==", user.uid),
      limit(10)
    );
    const unsubWorkouts = onSnapshot(workoutsQ, (snap) => {
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() } as WorkoutLog));
      setRecentWorkouts(logs.sort((a, b) => (b.date || "").localeCompare(a.date || "")));
    });

    // 3. Nutrition Listener
    const nutritionQ = query(
      collection(db, "nutrition_logs"),
      where("userId", "==", user.uid),
      limit(20)
    );
    const unsubNutrition = onSnapshot(nutritionQ, (snap) => {
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() } as NutritionLog));
      const todayLog = logs.find(l => l.date === today);
      setTodayNutrition(todayLog || null);
      setWeekNutrition(logs.filter(l => l.date >= sevenDaysAgoStr).sort((a, b) => a.date.localeCompare(b.date)));
    });

    // 4. Water Listener
    const waterQ = query(
      collection(db, "water_logs"),
      where("userId", "==", user.uid),
      limit(20)
    );
    const unsubWater = onSnapshot(waterQ, (snap) => {
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() } as WaterLog));
      const todayLog = logs.find(l => l.date === today);
      setTodayWater(todayLog || null);
      setWeekWater(logs.filter(l => l.date >= sevenDaysAgoStr).sort((a, b) => a.date.localeCompare(b.date)));
    });

    // 5. Weight Listener
    const weightQ = query(
      collection(db, "weight_logs"),
      where("userId", "==", user.uid),
      limit(30)
    );
    const unsubWeight = onSnapshot(weightQ, (snap) => {
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() } as WeightLog));
      setWeightHistory(logs.sort((a, b) => {
        const dateCompare = (a.date || "").localeCompare(b.date || "");
        if (dateCompare !== 0) return dateCompare;
        
        // Secondary sort by creation time if on the same day
        const aTime = a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime();
        const bTime = b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime();
        return aTime - bTime;
      }));
      setLoading(false);
    });

    // 6. Calendar Events Listener
    const eventsQ = query(
      collection(db, "calendar_events"),
      where("userId", "==", user.uid),
      limit(50)
    );
    const unsubEvents = onSnapshot(eventsQ, (snap) => {
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCalendarEvents(logs);
    });

    // 7. Sleep Logs Listener
    const sleepQ = query(
      collection(db, "sleep_logs"),
      where("userId", "==", user.uid),
      limit(10)
    );
    const unsubSleep = onSnapshot(sleepQ, (snap) => {
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSleepLogs(logs);
    });

    // 8. Progress Photos Listener
    const photosQ = query(
      collection(db, "progress_photos"),
      where("userId", "==", user.uid)
    );
    const unsubPhotos = onSnapshot(photosQ, (snap) => {
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort client-side to avoid needing a composite index
      logs.sort((a: any, b: any) => b.date.localeCompare(a.date));
      setProgressPhotos(logs);
    });

    return () => {
      unsubProfile();
      unsubWorkouts();
      unsubNutrition();
      unsubWater();
      unsubWeight();
      unsubEvents();
      unsubSleep();
      unsubPhotos();
    };
  }, [user]);

  return {
    user, profile, recentWorkouts,
    todayNutrition, weekNutrition,
    todayWater, weekWater,
    weightHistory,
    calendarEvents,
    sleepLogs,
    progressPhotos,
    vaultPin,
    loading, error
  };
}

