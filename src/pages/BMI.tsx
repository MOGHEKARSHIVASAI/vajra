import { useMemo, useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity, Apple, Droplets, Dumbbell, Flame, HeartPulse, Moon, Target, TrendingUp, Calculator, Save, Sparkles, ChevronRight, History, Plus
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart 
} from "recharts";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/services/firebase";
import { updateUserProfile, getUserProfile, logBodyStats } from "@/services/firestore";
import { useUserData } from "@/hooks/useUserData";
import { useToast } from "@/hooks/use-toast";

type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "athlete";
type Goal = "lose" | "maintain" | "gain";
type Sex = "male" | "female";

const ACTIVITY_LABEL: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (desk job)",
  light: "Light (1–2 days/wk)",
  moderate: "Moderate (3–5 days/wk)",
  active: "Active (6–7 days/wk)",
  athlete: "Athlete (2x/day)",
};

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, athlete: 1.9,
};

function classify(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", color: "warning", advice: "Build mass — eat in surplus, lift heavy.", range: "<18.5" };
  if (bmi < 25) return { label: "Optimal", color: "success", advice: "Lock it in — recomp and progressive overload.", range: "18.5–24.9" };
  if (bmi < 30) return { label: "Overweight", color: "warning", advice: "Cut fat slowly — keep lifting to preserve muscle.", range: "25–29.9" };
  return { label: "Obese", color: "destructive", advice: "Aggressive cut + low-impact cardio. Talk to a doctor.", range: "≥30" };
}

function buildPlan(input: { age: number; sex: Sex; height: number; weight: number; activity: ActivityLevel; goal: Goal }) {
  const { age, sex, height, weight, activity, goal } = input;
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  const cls = classify(bmi);

  const bmr = sex === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  const tdee = bmr * ACTIVITY_FACTOR[activity];
  const calorieAdj = goal === "lose" ? -500 : goal === "gain" ? 350 : 0;
  const calories = Math.round(tdee + calorieAdj);

  const proteinPerKg = goal === "gain" ? 2.0 : goal === "lose" ? 2.2 : 1.8;
  const protein = Math.round(weight * proteinPerKg);
  const fats = Math.round((calories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fats * 9) / 4));

  const activityWater = { sedentary: 0, light: 0.3, moderate: 0.6, active: 0.9, athlete: 1.2 }[activity];
  const water = +(weight * 0.035 + activityWater).toFixed(1);

  const sleep = activity === "athlete" || activity === "active" ? "8–9 h" : "7–8 h";

  let split = "Full Body 3x/week";
  if (cls.label === "Underweight" || goal === "gain") split = "Push / Pull / Legs (5–6x)";
  else if (cls.label === "Overweight" || cls.label === "Obese" || goal === "lose") split = "Upper / Lower + 3x cardio";
  else if (goal === "maintain") split = "PHUL — 4 days hypertrophy + power";

  const cardio = goal === "lose" ? 180 : goal === "gain" ? 60 : 120;

  const supps: string[] = ["Whey or plant protein"];
  if (goal === "gain") supps.push("Creatine 5g/day", "Carb powder around training");
  if (goal === "lose") supps.push("Creatine 5g/day", "Caffeine pre-workout");
  if (age >= 30) supps.push("Vitamin D3 + Omega-3");

  return {
    bmi: +bmi.toFixed(1),
    cls, bmr: Math.round(bmr), tdee: Math.round(tdee), calories,
    protein, carbs, fats, water, sleep, split, cardio, supps,
  };
}

const BMI = () => {
  const { toast } = useToast();
  const { user: hookUser, weightHistory, loading: hookLoading } = useUserData();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingWeight, setLoggingWeight] = useState(false);
  const [logWeightInput, setLogWeightInput] = useState<string>("");
  const initialized = useRef(false);

  const [age, setAge] = useState(26);
  const [sex, setSex] = useState<Sex>("male");
  const [height, setHeight] = useState(178);
  const [weight, setWeight] = useState(76);
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setLoading(true);
        const profile = await getUserProfile(u.uid);
        if (profile) {
          if (profile.age) setAge(profile.age);
          if (profile.sex) setSex(profile.sex);
          if (profile.height) setHeight(profile.height);
          if (profile.weight) setWeight(profile.weight);
          if (profile.activityLevel) setActivity(profile.activityLevel as ActivityLevel);
          if (profile.goal) setGoal(profile.goal as Goal);
        }
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // Only sync weight from history once when it loads for the first time
  useEffect(() => {
    if (!hookLoading && weightHistory && weightHistory.length > 0 && !initialized.current) {
      const latest = weightHistory[weightHistory.length - 1].weight;
      setWeight(latest);
      initialized.current = true;
    }
  }, [hookLoading, weightHistory]);

  const plan = useMemo(
    () => buildPlan({ age, sex, height, weight, activity, goal }),
    [age, sex, height, weight, activity, goal],
  );

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        age,
        sex,
        height,
        weight,
        activityLevel: activity,
        goal,
        goals: {
          calories: plan.calories,
          protein: plan.protein,
          water: plan.water * 1000, // converted to ml
        }
      });
      
      // Also log weight if it changed significantly or as a daily entry
      await logBodyStats(user.uid, {
        weight,
        date: new Date().toISOString().split("T")[0]
      });

      toast({
        title: "Plan Vajra!",
        description: "Your biometric plan and daily goals have been updated.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save your biometric data.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogWeight = async () => {
    if (!user) return;
    const weightToLog = logWeightInput ? parseFloat(logWeightInput) : weight;
    if (isNaN(weightToLog) || weightToLog <= 0) {
      toast({ title: "Invalid weight", description: "Please enter a valid weight.", variant: "destructive" });
      return;
    }

    setLoggingWeight(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      
      // 1. Log to history
      await logBodyStats(user.uid, {
        weight: weightToLog,
        date: today
      });

      // 2. Update local weight state so BMI updates immediately
      setWeight(weightToLog);

      setLogWeightInput("");
      toast({
        title: "Weight Recorded",
        description: `${weightToLog}kg has been added to your progress.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to log weight.",
        variant: "destructive"
      });
    } finally {
      setLoggingWeight(false);
    }
  };

  const gaugePos = Math.max(0, Math.min(100, ((plan.bmi - 15) / 25) * 100));

  if (loading) {
    return (
      <DashboardLayout title="BMI Intelligence" subtitle="Syncing biometrics...">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="BMI Intelligence"
      subtitle="Analyze your stats and build your personalized plan"
      action={
        <Button variant="hero" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <><div className="h-3 w-3 border-2 border-current border-t-transparent animate-spin mr-2" /> Saving</> : <><Save className="h-4 w-4 mr-2" /> Save to Profile</>}
        </Button>
      }
    >
      <div className="grid lg:grid-cols-[400px_1fr] gap-8">
        {/* Form Column */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-card border-border/50">
            <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Biometric Input
            </h2>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Age</Label>
                  <Input 
                    type="number" 
                    min={10} 
                    max={100} 
                    value={age} 
                    onChange={(e) => setAge(+e.target.value)} 
                    onFocus={(e) => e.target.select()}
                    className="bg-surface-1 border-border/40" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Sex</Label>
                  <div className="flex gap-1 p-1 bg-surface-1 rounded-lg border border-border/40">
                    {(["male", "female"] as Sex[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSex(s)}
                        className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${sex === s ? "bg-gradient-primary text-primary-foreground shadow-glow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Height (cm)</Label>
                  <Input 
                    type="number" 
                    value={height} 
                    onChange={(e) => setHeight(+e.target.value)} 
                    onFocus={(e) => e.target.select()}
                    className="bg-surface-1 border-border/40" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Weight (kg)</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={weight} 
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)} 
                    onFocus={(e) => e.target.select()}
                    className="bg-surface-1 border-border/40 font-bold" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Activity Level</Label>
                <div className="grid gap-1.5">
                  {(Object.keys(ACTIVITY_LABEL) as ActivityLevel[]).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setActivity(a)}
                      className={`flex items-center justify-between px-4 py-2.5 text-xs font-medium rounded-lg border transition-all ${activity === a ? "border-primary bg-primary/10 text-foreground" : "border-border/40 bg-surface-1 text-muted-foreground hover:border-primary/30"}`}
                    >
                      <span>{ACTIVITY_LABEL[a]}</span>
                      <Badge variant="outline" className="text-[10px] opacity-70">x{ACTIVITY_FACTOR[a]}</Badge>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Main Goal</Label>
                <div className="flex gap-1 p-1 bg-surface-1 rounded-lg border border-border/40">
                  {(["lose", "maintain", "gain"] as Goal[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGoal(g)}
                      className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${goal === g ? "bg-gradient-primary text-primary-foreground shadow-glow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Saving this plan will automatically update your <span className="text-foreground font-semibold">Daily Goals</span> for calories, protein, and water across the entire app.
              </p>
            </div>
          </Card>
        </div>

        {/* Results Column */}
        <div className="space-y-6">
          {/* BMI Summary */}
          <Card className="p-8 bg-gradient-card border-border/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-64 w-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Your BMI Score</div>
                  <div className="flex items-baseline gap-4">
                    <div className="font-display text-7xl font-bold gradient-text">{plan.bmi}</div>
                    <Badge className={`text-sm uppercase py-1 px-3 ${plan.cls.color === "success" ? "bg-success/20 text-success border-success/30" : plan.cls.color === "warning" ? "bg-warning/20 text-warning border-warning/30" : "bg-destructive/20 text-destructive border-destructive/30"}`}>
                      {plan.cls.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 max-w-md">{plan.cls.advice}</p>
                </div>
                <div className="hidden md:block w-32 h-32 rounded-2xl bg-surface-1 border border-border/40 p-4">
                   <Activity className="h-full w-full text-primary/40" />
                </div>
              </div>

              {/* Gauge */}
              <div className="mt-8">
                <div className="relative h-2.5 w-full bg-surface-2 rounded-full overflow-hidden flex">
                   <div className="h-full bg-warning/40" style={{ width: '14%' }} />
                   <div className="h-full bg-success/40" style={{ width: '26%' }} />
                   <div className="h-full bg-warning/40" style={{ width: '20%' }} />
                   <div className="h-full bg-destructive/40" style={{ width: '40%' }} />
                </div>
                <div className="relative mt-2">
                  <div 
                    className="absolute h-4 w-1 bg-foreground rounded-full -top-4 transition-all duration-700 shadow-glow"
                    style={{ left: `calc(${gaugePos}% - 2px)` }}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest px-1">
                    <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: HeartPulse, label: "BMR", value: plan.bmr, unit: "kcal", color: "primary" },
              { icon: TrendingUp, label: "TDEE", value: plan.tdee, unit: "kcal", color: "accent" },
              { icon: Target, label: "Daily Goal", value: plan.calories, unit: "kcal", color: "success" },
            ].map((m) => (
              <Card key={m.label} className="p-5 bg-gradient-card border-border/50 hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  <m.icon className={`h-3.5 w-3.5 text-${m.color}`} /> {m.label}
                </div>
                <div className="font-display text-3xl font-bold group-hover:gradient-text transition-all">{m.value.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{m.unit}</div>
              </Card>
            ))}
          </div>

          {/* Nutrition Prescription */}
          <Card className="p-6 bg-gradient-card border-border/50">
            <div className="flex items-center gap-2 mb-6">
              <Apple className="h-5 w-5 text-primary" />
              <h3 className="font-display text-xl font-bold">Nutrition Prescription</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {[
                  { label: "Protein", value: plan.protein, color: "hsl(var(--primary))", pct: Math.min(100, (plan.protein * 4 / plan.calories) * 100) },
                  { label: "Carbohydrates", value: plan.carbs, color: "hsl(var(--accent))", pct: Math.min(100, (plan.carbs * 4 / plan.calories) * 100) },
                  { label: "Healthy Fats", value: plan.fats, color: "hsl(var(--warning))", pct: Math.min(100, (plan.fats * 9 / plan.calories) * 100) },
                ].map((m) => (
                  <div key={m.label} className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{m.label}</span>
                      <span className="font-display font-bold">{m.value}g <span className="text-[10px] text-muted-foreground ml-1">({Math.round(m.pct)}%)</span></span>
                    </div>
                    <Progress value={m.pct} className="h-1.5" />
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-surface-1 border border-border/40 p-5 flex flex-col justify-center">
                 <div className="text-xs font-bold uppercase text-primary mb-2">Sample Daily Split</div>
                 <ul className="space-y-2 text-xs text-muted-foreground">
                   <li className="flex gap-2">
                     <span className="h-1 w-1 rounded-full bg-primary mt-1.5" />
                     <span>4–5 meals spaced 3-4 hours apart</span>
                   </li>
                   <li className="flex gap-2">
                     <span className="h-1 w-1 rounded-full bg-primary mt-1.5" />
                     <span>Lean protein with every major meal</span>
                   </li>
                   <li className="flex gap-2">
                     <span className="h-1 w-1 rounded-full bg-primary mt-1.5" />
                     <span>Carbs timed around your training window</span>
                   </li>
                 </ul>
              </div>
            </div>
          </Card>

          {/* Recovery & Activity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 bg-gradient-card border-border/50">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                <Droplets className="h-3.5 w-3.5 text-primary" /> Hydration
              </div>
              <div className="font-display text-3xl font-bold">{plan.water} <span className="text-sm font-sans font-medium text-muted-foreground">L</span></div>
              <div className="flex gap-1 mt-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < (plan.water / 0.7) ? "bg-primary" : "bg-surface-2"}`} />
                ))}
              </div>
            </Card>

            <Card className="p-5 bg-gradient-card border-border/50">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                <Moon className="h-3.5 w-3.5 text-accent" /> Optimal Sleep
              </div>
              <div className="font-display text-3xl font-bold">{plan.sleep}</div>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest">Recovery Window</p>
            </Card>

            <Card className="p-5 bg-gradient-card border-border/50">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                <Flame className="h-3.5 w-3.5 text-success" /> Weekly Cardio
              </div>
              <div className="font-display text-3xl font-bold">{plan.cardio} <span className="text-sm font-sans font-medium text-muted-foreground">min</span></div>
              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest">LISS / Zone 2</p>
            </Card>
          </div>

          {/* Training Split */}
          <Card className="p-6 bg-gradient-card border-border/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Dumbbell className="h-16 w-16" />
            </div>
            <div className="relative">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Recommended Split</div>
              <div className="font-display text-3xl font-bold gradient-text">{plan.split}</div>
              <div className="flex flex-wrap gap-2 mt-4">
                {plan.supps.map((s) => (
                  <Badge key={s} variant="outline" className="bg-surface-1 border-border/60 text-[10px] py-1">
                    {s}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-6 border-border/50 hover:bg-surface-2 group/btn" asChild>
                <a href="/routine" className="flex items-center">
                  Configure Weekly Routine <ChevronRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </Button>
            </div>
          </Card>

          {/* Weight Tracking Chart */}
          <Card className="p-6 bg-gradient-card border-border/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-display text-xl font-bold">Weight Progress</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input 
                    placeholder="75.0"
                    type="number"
                    step="0.1"
                    className="w-20 h-9 pr-7 text-xs bg-surface-1"
                    value={logWeightInput}
                    onChange={(e) => setLogWeightInput(e.target.value)}
                    onFocus={(e) => e.target.select()}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">kg</span>
                </div>
                <Button variant="hero" size="sm" className="h-9" onClick={handleLogWeight} disabled={loggingWeight}>
                  <Plus className="h-4 w-4 mr-1" /> {loggingWeight ? "..." : "Log"}
                </Button>
              </div>
            </div>
            {weightHistory.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightHistory.map((w, i) => {
                    const dateObj = new Date(w.date);
                    return { 
                      label: weightHistory.length > 8 ? `Week ${Math.floor(i/7) + 1}` : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
                      weight: w.weight 
                    };
                  })}>
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.1} vertical={false} />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis 
                      domain={['dataMin - 1', 'dataMax + 1']} 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10} tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(v) => `${v}kg`}
                    />
                    <Tooltip 
                      contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: '12px' }}
                      itemStyle={{ color: "hsl(var(--primary))", fontWeight: 'bold' }}
                      labelStyle={{ marginBottom: '4px', opacity: 0.7 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3} 
                      fill="url(#weightGrad)" 
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border/40 rounded-xl bg-surface-1/50">
                <History className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
                <p className="text-sm text-muted-foreground">Log your weight over a few days to see your progress chart.</p>
              </div>
            )}
            
            {weightHistory.length > 1 && (() => {
              const current = weightHistory[weightHistory.length - 1].weight;
              const previous = weightHistory[weightHistory.length - 2].weight;
              const diff = current - previous;
              const isReduction = diff < 0;

              return (
                <div className="mt-4 p-4 bg-surface-1/50 rounded-xl border border-border/40 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Last Change</div>
                    <div className={`font-display text-xl font-bold flex items-center gap-1 ${isReduction ? "text-success" : diff > 0 ? "text-warning" : "text-muted-foreground"}`}>
                      {isReduction ? <TrendingUp className="h-4 w-4 rotate-180" /> : diff > 0 ? <TrendingUp className="h-4 w-4" /> : null}
                      {diff > 0 ? "+" : ""}{diff.toFixed(1)} kg
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Prev / Current</div>
                    <div className="font-display text-lg font-bold">
                      {previous} <span className="text-muted-foreground text-xs font-normal">→</span> {current} kg
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BMI;
