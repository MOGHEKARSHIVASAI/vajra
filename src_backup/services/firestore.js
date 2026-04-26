import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  increment
} from "firebase/firestore";
import { db } from "./firebase";
export { db };

// User Profile
export const getUserProfile = async (uid) => {
  if (!db) return null;
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateUserProfile = async (uid, data) => {
  if (!db) return;
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, data);
};

// Workouts
export const logWorkout = async (uid, workoutData) => {
  if (!db) throw new Error('Firebase not configured');
  const workoutsRef = collection(db, "workouts");
  const docRef = await addDoc(workoutsRef, {
    ...workoutData,
    userId: uid,
    createdAt: serverTimestamp()
  });
  
  await updateDoc(doc(db, "users", uid), {
    "gamification.lastWorkoutDate": new Date().toISOString(),
    "gamification.xp": increment(workoutData.xpEarned || 0)
  });
  
  return docRef.id;
};

export const getWorkouts = async (uid, limitCount = 10) => {
  if (!db) return [];
  const q = query(
    collection(db, "workouts"), 
    where("userId", "==", uid), 
    orderBy("date", "desc"),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
  const snap = await getDocs(q);
  
  if (snap.empty) {
    return addDoc(nutritionRef, {
      userId: uid,
      date,
      meals: [mealData],
      totals: {
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fats: mealData.fats
      }
    });
  } else {
    const logDoc = snap.docs[0];
    const data = logDoc.data();
    const newMeals = [...data.meals, mealData];
    const newTotals = {
      calories: data.totals.calories + mealData.calories,
      protein: data.totals.protein + mealData.protein,
      carbs: data.totals.carbs + mealData.carbs,
      fats: data.totals.fats + mealData.fats
    };
    await updateDoc(doc(db, "nutrition_logs", logDoc.id), {
      meals: newMeals,
      totals: newTotals
    });
    return logDoc.id;
  }
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
    const logDoc = snap.docs[0];
    const data = logDoc.data();
    await updateDoc(doc(db, "water_logs", logDoc.id), {
      entries: [...data.entries, entry],
      total_ml: data.total_ml + amountMl
    });
    return logDoc.id;
  }
};

// Weight
export const logWeight = async (uid, weightData) => {
  const weightRef = collection(db, "weight_logs");
  return addDoc(weightRef, {
    ...weightData,
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
    createdAt: serverTimestamp()
  });
};

// Achievements
export const getAchievements = async (uid) => {
  const q = query(collection(db, "achievements"), where("userId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
