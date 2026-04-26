import { 
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, 
  query, where, orderBy, limit, serverTimestamp, increment, deleteDoc 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
export { db, storage };

// Helper to wrap a promise with a timeout
const withTimeout = (promise, ms = 10000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), ms))
  ]);
};

// User Profile
export const getUserProfile = async (uid) => {
  if (!db) return null;
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await withTimeout(getDoc(docRef));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("[Firestore] getUserProfile failed:", error);
    return null;
  }
};

export const updateUserProfile = async (uid, data) => {
  if (!db) return;
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, data);
};

export const updateUserGoals = async (uid, goals) => {
  if (!db) return;
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, { goals });
};

// Workouts
export const logWorkout = async (uid, workoutData) => {
  console.log("[Firestore] Logging workout for:", uid, workoutData);
  const workoutsRef = collection(db, "workouts");
  const docRef = await addDoc(workoutsRef, {
    ...workoutData,
    userId: uid,
    createdAt: serverTimestamp()
  });
  
  console.log("[Firestore] Workout saved, id:", docRef.id, ". Updating user gamification...");
  
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const gamification = userData.gamification || { xp: 0, level: 1, streak: 0 };
    
    let xp = (gamification.xp || 0) + (workoutData.xpEarned || 0);
    let level = Math.floor(xp / 1000) + 1;
    let streak = gamification.streak || 0;
    
    const lastDateStr = gamification.lastWorkoutDate;
    const todayStr = new Date().toISOString().split("T")[0];
    
    if (lastDateStr) {
      const lastDate = lastDateStr.split("T")[0];
      if (lastDate !== todayStr) {
        const last = new Date(lastDate);
        const today = new Date(todayStr);
        const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) streak += 1;
        else if (diffDays > 1) streak = 1;
      }
    } else {
      streak = 1;
    }

    // Achievement Checks
    const achievements = userData.achievements || [];
    const newAchievements = [...achievements];
    
    // Vajra Master Check (100 workouts)
    const totalWorkouts = (userData.totalWorkouts || 0) + 1;
    if (totalWorkouts >= 100 && !achievements.includes("Vajra Master")) {
      newAchievements.push("Vajra Master");
    }
    
    // Inferno Check (30 day streak)
    if (streak >= 30 && !achievements.includes("Inferno")) {
      newAchievements.push("Inferno");
    }

    await updateDoc(userRef, {
      "gamification.lastWorkoutDate": new Date().toISOString(),
      "gamification.xp": xp,
      "gamification.level": level,
      "gamification.streak": streak,
      "totalWorkouts": totalWorkouts,
      "achievements": newAchievements
    });
  }
  
  console.log("[Firestore] User gamification updated.");
  return docRef.id;
};

export const getWorkouts = async (uid, limitCount = 10) => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "workouts"), 
      where("userId", "==", uid), 
      orderBy("date", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await withTimeout(getDocs(q));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("[Firestore] getWorkouts failed:", error);
    return [];
  }
};

// Exercises
export const getExercises = async (uid) => {
  if (!db) return [];
  const globalQ = query(collection(db, "exercises"), where("isCustom", "==", false));
  const userQ = query(collection(db, "exercises"), where("userId", "==", uid));
  
  const [globalSnap, userSnap] = await Promise.all([getDocs(globalQ), getDocs(userQ)]);
  
  const globalEx = globalSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const userEx = userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return [...globalEx, ...userEx];
};

export const addCustomExercise = async (uid, exerciseData) => {
  const exercisesRef = collection(db, "exercises");
  return addDoc(exercisesRef, {
    ...exerciseData,
    userId: uid,
    isCustom: true
  });
};

// Nutrition
export const logMeal = async (uid, date, mealData) => {
  const nutritionRef = collection(db, "nutrition_logs");
  const q = query(nutritionRef, where("userId", "==", uid), where("date", "==", date));
  const snap = await withTimeout(getDocs(q));
  
  const mealWithId = { ...mealData, id: mealData.id || Date.now().toString() };
  
  if (snap.empty) {
    return addDoc(nutritionRef, {
      userId: uid,
      date,
      meals: [mealWithId],
      totals: {
        calories: mealWithId.calories || mealWithId.kcal || 0,
        protein: mealWithId.protein || 0,
        carbs: mealWithId.carbs || 0,
        fats: mealWithId.fats || 0
      }
    });
  } else {
    console.log("[Firestore] Log found, updating existing entry...");
    const logDoc = snap.docs[0];
    const data = logDoc.data();
    // Ensure all existing meals have IDs
    const existingMeals = (data.meals || []).map((m, idx) => ({ 
      ...m, 
      id: m.id || `legacy-${Date.now()}-${idx}` 
    }));
    const newMeals = [...existingMeals, mealWithId];
    const newTotals = {
      calories: (data.totals?.calories || 0) + (mealWithId.calories || mealWithId.kcal || 0),
      protein: (data.totals?.protein || 0) + (mealWithId.protein || 0),
      carbs: (data.totals?.carbs || 0) + (mealWithId.carbs || 0),
      fats: (data.totals?.fats || 0) + (mealWithId.fats || 0)
    };
    await updateDoc(doc(db, "nutrition_logs", logDoc.id), {
      meals: newMeals,
      totals: newTotals
    });
    console.log("[Firestore] Meal added successfully.");
    return logDoc.id;
  }
};

export const updateMeal = async (uid, date, mealId, updatedMealData) => {
  const nutritionRef = collection(db, "nutrition_logs");
  const q = query(nutritionRef, where("userId", "==", uid), where("date", "==", date));
  const snap = await withTimeout(getDocs(q));
  
  if (snap.empty) throw new Error("Nutrition log not found for this date");
  
  const logDoc = snap.docs[0];
  const data = logDoc.data();
  // Map meals and ensure IDs exist for matching
  const meals = (data.meals || []).map((m, idx) => ({ 
    ...m, 
    id: m.id || `legacy-${idx}` 
  }));
  
  const mealIndex = meals.findIndex(m => m.id === mealId);
  if (mealIndex === -1) throw new Error("Meal not found");
  
  const oldMeal = meals[mealIndex];
  const updatedMeal = { ...oldMeal, ...updatedMealData, id: mealId };
  const newMeals = [...meals];
  newMeals[mealIndex] = updatedMeal;
  
  const newTotals = {
    calories: (data.totals?.calories || 0) - (oldMeal.calories || oldMeal.kcal || 0) + (updatedMeal.calories || updatedMeal.kcal || 0),
    protein: (data.totals?.protein || 0) - (oldMeal.protein || 0) + (updatedMeal.protein || 0),
    carbs: (data.totals?.carbs || 0) - (oldMeal.carbs || 0) + (updatedMeal.carbs || 0),
    fats: (data.totals?.fats || 0) - (oldMeal.fats || 0) + (updatedMeal.fats || 0)
  };
  
  await updateDoc(doc(db, "nutrition_logs", logDoc.id), {
    meals: newMeals,
    totals: newTotals
  });
};

export const deleteMeal = async (uid, date, mealId) => {
  const nutritionRef = collection(db, "nutrition_logs");
  const q = query(nutritionRef, where("userId", "==", uid), where("date", "==", date));
  const snap = await withTimeout(getDocs(q));
  
  if (snap.empty) throw new Error("Nutrition log not found for this date");
  
  const logDoc = snap.docs[0];
  const data = logDoc.data();
  // Map meals and ensure IDs exist for matching
  const meals = (data.meals || []).map((m, idx) => ({ 
    ...m, 
    id: m.id || `legacy-${idx}` 
  }));
  
  const mealToDelete = meals.find(m => m.id === mealId);
  if (!mealToDelete) throw new Error("Meal not found");
  
  const newMeals = meals.filter(m => m.id !== mealId);
  const newTotals = {
    calories: Math.max(0, (data.totals?.calories || 0) - (mealToDelete.calories || mealToDelete.kcal || 0)),
    protein: Math.max(0, (data.totals?.protein || 0) - (mealToDelete.protein || 0)),
    carbs: Math.max(0, (data.totals?.carbs || 0) - (mealToDelete.carbs || 0)),
    fats: Math.max(0, (data.totals?.fats || 0) - (mealToDelete.fats || 0))
  };
  
  await updateDoc(doc(db, "nutrition_logs", logDoc.id), {
    meals: newMeals,
    totals: newTotals
  });
};

export const getNutritionLogs = async (uid, limitCount = 7) => {
  const q = query(
    collection(db, "nutrition_logs"), 
    where("userId", "==", uid), 
    orderBy("date", "desc"),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Water
export const logWater = async (uid, date, amountMl) => {
  const waterRef = collection(db, "water_logs");
  const q = query(waterRef, where("userId", "==", uid), where("date", "==", date));
  const snap = await getDocs(q);
  
  const entry = { amount_ml: amountMl, time: new Date().toISOString() };
  
  if (snap.empty) {
    return addDoc(waterRef, {
      userId: uid,
      date,
      entries: [entry],
      total_ml: amountMl
    });
  } else {
    console.log("[Firestore] Log found, updating water entry...");
    const logDoc = snap.docs[0];
    const data = logDoc.data();
    await updateDoc(doc(db, "water_logs", logDoc.id), {
      entries: [...(data.entries || []), entry],
      total_ml: (data.total_ml || 0) + amountMl
    });
    console.log("[Firestore] Water updated successfully.");
    return logDoc.id;
  }
};

// Body Stats
export const logBodyStats = async (uid, statsData) => {
  const statsRef = collection(db, "weight_logs"); // We reuse weight_logs but add bodyFat etc
  return addDoc(statsRef, {
    ...statsData,
    userId: uid,
    createdAt: serverTimestamp(),
    date: statsData.date || new Date().toISOString().split("T")[0]
  });
};

export const logWeight = logBodyStats; // Alias for backward compatibility

// Calendar Events
export const logEvent = async (uid, eventData) => {
  const eventRef = collection(db, "calendar_events");
  return addDoc(eventRef, {
    ...eventData,
    userId: uid,
    createdAt: serverTimestamp()
  });
};

// Sleep
export const logSleep = async (uid, sleepData) => {
  const sleepRef = collection(db, "sleep_logs");
  return addDoc(sleepRef, {
    ...sleepData,
    userId: uid,
    createdAt: serverTimestamp(),
    date: sleepData.date || new Date().toISOString().split("T")[0]
  });
};

// Achievements
export const getAchievements = async (uid) => {
  const q = query(collection(db, "achievements"), where("userId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Progress Photos
export const logProgressPhoto = async (uid, photoData) => {
  const photoRef = collection(db, "progress_photos");
  return addDoc(photoRef, {
    ...photoData,
    userId: uid,
    createdAt: serverTimestamp(),
    date: photoData.date || new Date().toISOString().split("T")[0]
  });
};

export const deleteProgressPhoto = async (photoId) => {
  const photoRef = doc(db, "progress_photos", photoId);
  return deleteDoc(photoRef);
};

export const uploadProgressPhoto = async (uid, file) => {
  if (!storage) throw new Error("Storage not initialized");
  console.log("[Storage] Starting upload for file:", file.name);
  
  try {
    const storageRef = ref(storage, `progress_photos/${uid}/${Date.now()}_${file.name}`);
    
    // Use withTimeout to prevent infinite hanging
    const snapshot = await withTimeout(uploadBytes(storageRef, file), 15000);
    console.log("[Storage] Upload successful, getting URL...");
    
    const url = await withTimeout(getDownloadURL(snapshot.ref), 5000);
    console.log("[Storage] URL generated:", url);
    return url;
  } catch (error) {
    console.error("[Storage] Critical failure:", error);
    throw error;
  }
};

export const updateVaultPin = async (uid, pin) => {
  const userRef = doc(db, "users", uid);
  return updateDoc(userRef, { vaultPin: pin });
};

// Seed Data
export const seedExercises = async () => {
  const { EXERCISE_LIBRARY } = await import("../utils/constants");
  const exercisesRef = collection(db, "exercises");
  const q = query(exercisesRef, where("isCustom", "==", false), limit(1));
  const snap = await getDocs(q);
  
  if (snap.empty) {
    console.log("Seeding exercise library...");
    const promises = EXERCISE_LIBRARY.map(exercise => addDoc(exercisesRef, exercise));
    await Promise.all(promises);
    console.log("Seeding complete.");
  }
};
