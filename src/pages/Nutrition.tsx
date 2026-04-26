import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Apple, Plus, Sparkles, Search, Coffee, Sandwich, Pizza, Cookie, ChevronRight, Brain, Utensils, Pencil, Trash2 } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { toast } from "sonner";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/services/firebase";
import { logMeal, updateMeal, deleteMeal } from "@/services/firestore";
import {
  collection, query, where, orderBy, limit, getDocs, addDoc
} from "firebase/firestore";
import { db } from "@/services/firestore";

const todayStr = () => new Date().toISOString().split("T")[0];

const MEAL_ICONS: Record<string, any> = {
  Breakfast: Coffee, Lunch: Sandwich, Snack: Cookie, Dinner: Pizza,
};

function MacroRing({ label, current, goal, unit, color }: {
  label: string; current: number; goal: number; unit: string; color: string;
}) {
  const pct = Math.min((current / Math.max(goal, 1)) * 100, 100);
  const r = 50;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <Card className="p-5 bg-gradient-card border-border/50 text-center">
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} stroke="hsl(var(--border))" strokeWidth="8" fill="none" opacity={0.4} />
          <circle cx="60" cy="60" r={r} stroke={color} strokeWidth="8" fill="none"
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 8px ${color})` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-display text-2xl font-bold">{current}</div>
          <div className="text-[10px] text-muted-foreground">/ {goal}{unit}</div>
        </div>
      </div>
      <div className="mt-3 font-semibold text-sm">{label}</div>
      <div className="text-xs text-muted-foreground">{Math.round(pct)}% of goal</div>
    </Card>
  );
}

interface MealLog {
  meal: string;
  time?: string;
  kcal: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  items?: string[];
}

const Nutrition = () => {
  const { user: hookUser, profile, todayNutrition, loading: dataLoading } = useUserData();
  const [user, setUser] = useState<User | null>(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logData, setLogData] = useState({ meal: "Breakfast", kcal: "", protein: "", carbs: "", fats: "", items: "" });
  const [saving, setSaving] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);

  const meals = todayNutrition?.meals ?? [];
  const totals = todayNutrition?.totals ?? { calories: 0, protein: 0, carbs: 0, fats: 0 };

  const calorieGoal = profile?.goals?.calories ?? 2500;
  const proteinGoal = profile?.goals?.protein ?? 170;
  const carbsGoal = profile?.goals?.carbs ?? 320;
  const fatsGoal = profile?.goals?.fats ?? 85;
  const calPct = (totals.calories / calorieGoal) * 100;

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleLogMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const kcalVal = Number(logData.kcal);
      const proteinVal = Number(logData.protein) || 0;
      const carbsVal = Number(logData.carbs) || 0;
      const fatsVal = Number(logData.fats) || 0;
      const itemsArr = logData.items ? logData.items.split(",").map(s => s.trim()) : [];

      const mealData = {
        meal: logData.meal,
        kcal: kcalVal,
        calories: kcalVal,
        protein: proteinVal,
        carbs: carbsVal,
        fats: fatsVal,
        items: itemsArr,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      if (editingMealId) {
        await updateMeal(user.uid, todayStr(), editingMealId, mealData);
        toast.success("Meal updated successfully!");
      } else {
        await logMeal(user.uid, todayStr(), mealData);
        toast.success("Meal logged successfully!");
      }

      setLogData({ meal: "Breakfast", kcal: "", protein: "", carbs: "", fats: "", items: "" });
      setEditingMealId(null);
      setShowLogForm(false);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save meal: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (m: any) => {
    setLogData({
      meal: m.meal,
      kcal: String(m.kcal || m.calories || ""),
      protein: String(m.protein || ""),
      carbs: String(m.carbs || ""),
      fats: String(m.fats || ""),
      items: m.items ? m.items.join(", ") : "",
    });
    setEditingMealId(m.id);
    setShowLogForm(true);
  };

  const handleDeleteClick = async (mealId: string) => {
    if (!user || !mealId) return;
    
    try {
      await deleteMeal(user.uid, todayStr(), mealId);
      toast.success("Meal deleted");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete meal");
    }
  };

  return (
    <DashboardLayout
      title="Nutrition"
      subtitle={`Today · ${totals.calories} / ${calorieGoal} kcal · ${calorieGoal - totals.calories} remaining`}
      action={<Button variant="hero" size="sm" onClick={() => setShowLogForm(true)}><Plus className="h-4 w-4" /> Log food</Button>}
    >
      {/* Log form modal */}
      {showLogForm && (
        <Card className="p-6 bg-gradient-card border-primary/30 animate-fade-in">
          <h3 className="font-display font-semibold text-lg mb-4">Log a meal</h3>
          <form onSubmit={handleLogMeal} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Meal type</label>
                <select value={logData.meal} onChange={e => setLogData(d => ({ ...d, meal: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg bg-surface-1 border border-border/40 text-sm text-foreground">
                  {["Breakfast", "Lunch", "Snack", "Dinner", "Other"].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Calories (kcal) *</label>
                <Input type="number" placeholder="500" value={logData.kcal} required min="1"
                  onChange={e => setLogData(d => ({ ...d, kcal: e.target.value }))}
                  onFocus={(e) => e.target.select()}
                  className="bg-surface-1 border-border/40 h-10" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Protein (g)</label>
                <Input type="number" placeholder="30" value={logData.protein}
                  onChange={e => setLogData(d => ({ ...d, protein: e.target.value }))}
                  onFocus={(e) => e.target.select()}
                  className="bg-surface-1 border-border/40 h-10" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Carbs (g)</label>
                <Input type="number" placeholder="60" value={logData.carbs}
                  onChange={e => setLogData(d => ({ ...d, carbs: e.target.value }))}
                  onFocus={(e) => e.target.select()}
                  className="bg-surface-1 border-border/40 h-10" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Fats (g)</label>
                <Input type="number" placeholder="15" value={logData.fats}
                  onChange={e => setLogData(d => ({ ...d, fats: e.target.value }))}
                  onFocus={(e) => e.target.select()}
                  className="bg-surface-1 border-border/40 h-10" />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-xs text-muted-foreground">Food items (comma separated)</label>
                <Input placeholder="Chicken breast, Rice, Salad" value={logData.items}
                  onChange={e => setLogData(d => ({ ...d, items: e.target.value }))}
                  className="bg-surface-1 border-border/40 h-10" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="hero" className="flex-1" disabled={saving}>
                {saving ? "Saving..." : editingMealId ? "Update meal" : "Save meal"}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setShowLogForm(false);
                setEditingMealId(null);
                setLogData({ meal: "Breakfast", kcal: "", protein: "", carbs: "", fats: "", items: "" });
              }}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Calorie hero */}
      <Card className="relative overflow-hidden bg-gradient-card border-border/50 p-6 md:p-8">
        <div className="absolute -top-20 -right-20 h-64 w-64 bg-primary/15 rounded-full blur-3xl" />
        <div className="relative grid md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="text-xs text-primary uppercase tracking-widest font-semibold mb-2">Daily Calories</div>
            <div className="flex items-baseline gap-2">
              <div className="font-display text-5xl md:text-6xl font-bold gradient-text">
                {totals.calories.toLocaleString()}
              </div>
              <div className="text-muted-foreground">/ {calorieGoal.toLocaleString()} kcal</div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              You have <span className="text-foreground font-semibold">{Math.max(0, calorieGoal - totals.calories)} kcal</span> left for today.
            </p>
            <div className="mt-5 h-2 bg-surface-1 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min(calPct, 100)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{Math.round(Math.min(calPct, 100))}% consumed</span>
              <span>{Math.max(0, Math.round(100 - calPct))}% left</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MacroRing label="Protein" current={totals.protein} goal={proteinGoal} unit="g" color="hsl(var(--primary))" />
            <MacroRing label="Carbs" current={totals.carbs} goal={carbsGoal} unit="g" color="hsl(var(--accent))" />
            <MacroRing label="Fats" current={totals.fats} goal={fatsGoal} unit="g" color="hsl(var(--warning))" />
          </div>
        </div>
      </Card>

      {/* Meals + AI */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-display font-semibold text-lg px-1">Today's meals</h3>

          {dataLoading ? (
            <Card className="p-8 bg-gradient-card border-border/50 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </Card>
          ) : meals.length === 0 ? (
            <Card className="p-8 bg-gradient-card border-dashed border-border/60">
              <div className="text-center space-y-3">
                <Utensils className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-sm font-medium">No meals logged today</p>
                <p className="text-xs text-muted-foreground">Click "Log food" to track your nutrition.</p>
                <Button variant="outline" size="sm" onClick={() => setShowLogForm(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Log first meal
                </Button>
              </div>
            </Card>
          ) : (
            meals.map((m, i) => {
              const Icon = MEAL_ICONS[m.meal] ?? Utensils;
              // Ensure every meal has an ID for the UI
              const mealWithId = { ...m, id: m.id || `legacy-${i}` };
              
              return (
                <Card key={mealWithId.id} className="p-4 bg-gradient-card border-border/50 hover:border-primary/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{m.meal}</span>
                        {m.time && <Badge variant="outline" className="text-[10px] border-border/50">{m.time}</Badge>}
                      </div>
                      {m.items && m.items.length > 0 && (
                        <div className="text-xs text-muted-foreground truncate mt-0.5">{m.items.join(" · ")}</div>
                      )}
                      {(m.protein != null || m.kcal != null) && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          P: {m.protein ?? 0}g · C: {m.carbs ?? 0}g · F: {m.fats ?? 0}g
                        </div>
                      )}
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="font-display font-bold gradient-text">{m.kcal ?? m.calories}</div>
                        <div className="text-[10px] text-muted-foreground">kcal</div>
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleEditClick(mealWithId)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteClick(mealWithId.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}

          {/* Quick add */}
          <Card className="p-4 bg-gradient-card border-dashed border-border/60 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setShowLogForm(true)}>
            <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="h-5 w-5" />
              <span className="text-sm">Log another meal...</span>
            </div>
          </Card>
        </div>

        {/* AI meal suggestions */}
        <Card className="p-6 bg-gradient-card border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-primary/15 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold">AI Meal Picks</h3>
              <Sparkles className="h-3 w-3 text-primary ml-auto" />
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              For your remaining {Math.max(0, calorieGoal - totals.calories)} kcal & {Math.max(0, proteinGoal - totals.protein)}g protein.
            </p>
            <div className="space-y-3">
              {[
                { name: "Protein Power Bowl", kcal: 480, protein: 42, tag: "High protein" },
                { name: "Mediterranean Wrap", kcal: 520, protein: 28, tag: "Balanced" },
                { name: "Whey + Banana Shake", kcal: 290, protein: 35, tag: "Quick" },
              ].map((s) => (
                <div key={s.name} className="p-3 rounded-lg bg-surface-1 border border-border/40 hover:border-primary/40 transition-all hover:-translate-y-0.5 cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="font-semibold text-sm">{s.name}</div>
                    <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">{s.tag}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>🔥 {s.kcal} kcal</span>
                    <span>💪 {s.protein}g protein</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">Generate more <Sparkles className="h-3.5 w-3.5" /></Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Nutrition;
