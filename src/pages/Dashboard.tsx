import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MuscleModel3D } from "@/components/MuscleModel3D";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Apple, Brain, Droplets, Flame, Trophy, Heart, Plus, TrendingUp, Target,
  Sparkles, Moon, Zap, Dumbbell, AlertCircle,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart as RLineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useUserData } from "@/hooks/useUserData";
import { Link } from "react-router-dom";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Dashboard = () => {
  const [highlights] = useState(["chest", "arms", "shoulders"]);
  const { 
    user, profile, recentWorkouts, 
    todayNutrition, weekNutrition, 
    todayWater, weekWater, 
    loading 
  } = useUserData();

  // ── Derived values ──────────────────────────────────────────────
  const firstName = user?.displayName
    ? user.displayName.split(" ")[0]
    : user?.email?.split("@")[0] ?? "there";

  const today = new Date().toISOString().split("T")[0];
  const dayName = DAYS[new Date().getDay()];

  const gamification = profile?.gamification ?? { xp: 0, level: 0, streak: 0 };
  const calorieGoal = profile?.goals?.calories ?? 2500;
  const waterGoalL = (profile?.goals?.water ?? 3000) / 1000;
  const proteinGoal = profile?.goals?.protein ?? 170;

  const todayCalories = todayNutrition?.totals?.calories ?? 0;
  const todayProtein = todayNutrition?.totals?.protein ?? 0;
  const todayWaterL = todayWater ? todayWater.total_ml / 1000 : 0;

  // ── Notifications ──────────────────────────────────────────────
  const [notifiedGoals, setNotifiedGoals] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!profile?.preferences?.notifications) return;
    if (loading) return;

    const checks = [
      { id: 'calories', val: todayCalories, goal: calorieGoal, label: 'Calorie goal reached! 🍴' },
      { id: 'protein', val: todayProtein, goal: proteinGoal, label: 'Protein target hit! 💪' },
      { id: 'water', val: todayWaterL, goal: waterGoalL, label: 'Hydration goal complete! 💧' },
    ];

    checks.forEach(check => {
      if (check.val >= check.goal && !notifiedGoals.has(check.id) && check.val > 0) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("VAJRA Achievement", { body: check.label });
        }
        setNotifiedGoals(prev => new Set(prev).add(check.id));
      }
    });
  }, [todayCalories, todayProtein, todayWaterL, profile, loading]);

  // Nutrition chart data from last 7 days
  const nutritionChartData = (() => {
    if (!weekNutrition || weekNutrition.length === 0) return [];
    // Last 7 days in order
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      const log = weekNutrition.find(l => l.date === dateStr);
      return {
        day: DAYS[d.getDay()],
        cal: log?.totals?.calories ?? 0,
      };
    });
    return last7Days;
  })();

  // Water chart data from last 7 days
  const waterChartData = (() => {
    if (!weekWater || weekWater.length === 0) return [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      const log = weekWater.find(l => l.date === dateStr);
      return {
        day: DAYS[d.getDay()],
        ml: log?.total_ml ?? 0,
      };
    });
    return last7Days;
  })();

  // Today's workouts (those logged today)
  const todayWorkouts = recentWorkouts.filter(w => {
    const d = w.date ?? (w.createdAt?.toDate ? w.createdAt.toDate().toISOString().split("T")[0] : null);
    return d === today;
  });

  // ── Stats cards ──────────────────────────────────────────────────
  const stats = [
    {
      icon: Flame, label: "Streak", color: "primary",
      value: gamification.streak > 0 ? String(gamification.streak) : "0",
      unit: "days",
      trend: gamification.streak > 0 ? `${gamification.streak} 🔥` : "Start!",
    },
    {
      icon: Trophy, label: "Level", color: "accent",
      value: gamification.level > 0 ? String(gamification.level) : "1",
      unit: `${gamification.xp ?? 0} XP`,
      trend: `Lv.${gamification.level ?? 1}`,
    },
    {
      icon: Heart, label: "Calories", color: "success",
      value: todayCalories > 0 ? todayCalories.toLocaleString() : "0",
      unit: `/ ${calorieGoal.toLocaleString()}`,
      trend: `${Math.round((todayCalories / calorieGoal) * 100)}%`,
    },
    {
      icon: Droplets, label: "Water", color: "primary",
      value: todayWaterL > 0 ? todayWaterL.toFixed(1) : "0",
      unit: `/ ${waterGoalL.toFixed(1)} L`,
      trend: `${Math.round((todayWaterL / waterGoalL) * 100)}%`,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title={`Welcome back, ${firstName}`} subtitle="Loading your data...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            <p className="text-muted-foreground text-sm">Fetching your data from Firebase...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`Welcome back, ${firstName}`}
      subtitle={`${dayName} · ${recentWorkouts.length > 0 ? `${recentWorkouts.length} recent workouts` : "No workouts logged yet"}`}
      action={<Button variant="hero" size="sm" asChild><Link to="/workouts"><Plus className="h-4 w-4" /> Log workout</Link></Button>}
    >
      {/* Quick Actions & Check-in */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2 p-6 bg-gradient-card border-border/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy className="h-20 w-20" />
          </div>
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${todayWorkouts.length > 0 ? "bg-success/20 text-success shadow-glow-success scale-110" : "bg-surface-2 text-muted-foreground"}`}>
                {todayWorkouts.length > 0 ? <Zap className="h-8 w-8 animate-pulse" /> : <Dumbbell className="h-8 w-8" />}
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold">
                  {todayWorkouts.length > 0 ? "Gym Session: Logged!" : "Ready to hit the gym?"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {todayWorkouts.length > 0 ? "Great work! You've crushed your training for today." : "Complete a workout to keep your streak alive."}
                </p>
              </div>
            </div>
            {todayWorkouts.length > 0 ? (
              <Badge className="bg-success/15 text-success border-success/30 px-4 py-2 text-sm uppercase font-bold tracking-widest animate-in fade-in zoom-in">
                Status: Completed
              </Badge>
            ) : (
              <Button size="lg" variant="hero" asChild>
                <Link to="/workouts"><Plus className="h-4 w-4 mr-2" /> Start Workout</Link>
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-ember border-0 relative overflow-hidden flex flex-col justify-center">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,transparent,rgba(0,0,0,0.5))]" />
           <div className="relative z-10">
              <div className="text-[10px] uppercase tracking-widest text-primary-foreground/70 mb-1">Current Streak</div>
              <div className="font-display text-5xl font-bold text-primary-foreground flex items-baseline gap-2">
                {gamification.streak} <span className="text-xl font-sans font-medium opacity-70">Days</span>
              </div>
              <p className="text-[10px] text-primary-foreground/60 mt-2 uppercase tracking-widest font-bold">
                {gamification.streak > 0 ? "You're on fire! Keep it up." : "Start your streak today!"}
              </p>
           </div>
        </Card>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 bg-gradient-card border-border/50 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.color === "primary" ? "bg-primary/15 text-primary" : s.color === "accent" ? "bg-accent/15 text-accent" : "bg-success/15 text-success"}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">{s.trend}</Badge>
            </div>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-display text-2xl font-bold">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.unit}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calorie chart */}
        <Card className="lg:col-span-2 p-6 bg-gradient-card border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-lg">Calorie Intake</h3>
              <p className="text-xs text-muted-foreground">Last 7 days · kcal</p>
            </div>
            <Badge variant="outline" className="border-border/50 text-muted-foreground">7-day</Badge>
          </div>
          {nutritionChartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={nutritionChartData}>
                  <defs>
                    <linearGradient id="calG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="cal" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#calG)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={Heart}
              title="No nutrition logged yet"
              description="Start logging your meals to see calorie trends here."
              action={{ label: "Log food", to: "/nutrition" }}
            />
          )}
        </Card>

        {/* Muscle heatmap */}
        <Card className="p-6 bg-gradient-card border-border/50 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-display font-semibold text-lg">Muscle Heatmap</h3>
              <p className="text-xs text-muted-foreground">This week · drag to rotate</p>
            </div>
          </div>
          <div className="h-72 -mx-2">
            <MuscleModel3D highlights={highlights} className="h-full w-full" />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {highlights.map((m) => (
              <Badge key={m} className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/20">{m}</Badge>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Water chart */}
        <Card className="p-6 bg-gradient-card border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-lg">Hydration</h3>
              <p className="text-xs text-muted-foreground">7-day intake (ml)</p>
            </div>
          </div>
          {waterChartData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterChartData}>
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="ml" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={Droplets}
              title="No water logged"
              description="Track your hydration daily."
              action={{ label: "Log water", to: "/hydration" }}
              compact
            />
          )}
        </Card>

        {/* Recent workouts */}
        <Card className="p-6 bg-gradient-card border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-lg">Recent Workouts</h3>
              <p className="text-xs text-muted-foreground">Your last 7 sessions</p>
            </div>
          </div>
          {recentWorkouts.length > 0 ? (
            <div className="space-y-2">
              {recentWorkouts.slice(0, 4).map((w, i) => {
                const dateStr = w.date ?? w.createdAt?.toDate?.()?.toLocaleDateString() ?? "—";
                return (
                  <div key={w.id ?? i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-1 border border-border/40 hover:border-primary/30 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Dumbbell className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{w.name ?? "Workout"}</div>
                      <div className="text-xs text-muted-foreground">{dateStr}</div>
                    </div>
                    {w.totalVolume && (
                      <div className="text-sm font-bold gradient-text">{w.totalVolume.toLocaleString()} kg</div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Dumbbell}
              title="No workouts yet"
              description="Log your first workout to track progress."
              action={{ label: "Start workout", to: "/workouts" }}
              compact
            />
          )}
        </Card>

        {/* AI Coach tips */}
        <Card className="p-6 bg-gradient-card border-border/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary fill-current" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm">AI Coach</h3>
                <p className="text-xs text-muted-foreground">Personalized tips</p>
              </div>
              <Sparkles className="h-3.5 w-3.5 text-primary ml-auto" />
            </div>
            <div className="space-y-3">
              {[
                {
                  icon: Zap, text: todayCalories > 0
                    ? `You've had ${todayCalories} kcal today. ${todayCalories < calorieGoal ? `${calorieGoal - todayCalories} kcal remaining.` : "Goal reached! 🎉"}`
                    : "Log your meals today to get personalized calorie insights.",
                  tone: "primary"
                },
                {
                  icon: Droplets, text: todayWaterL > 0
                    ? `Water: ${todayWaterL.toFixed(1)}L of ${waterGoalL.toFixed(1)}L. ${todayWaterL >= waterGoalL ? "Goal reached! 💧" : "Keep drinking!"}`
                    : "Stay hydrated! Log your water intake on the Hydration page.",
                  tone: "accent"
                },
                {
                  icon: Moon, text: recentWorkouts.length > 0
                    ? `${recentWorkouts.length} workouts logged. Keep up the consistency!`
                    : "No workouts logged yet. Start your first session today!",
                  tone: "warning"
                },
              ].map((tip, i) => (
                <div key={i} className="flex gap-2.5 p-2.5 rounded-lg bg-surface-1 border border-border/40 hover:border-primary/30 transition-colors">
                  <tip.icon className={`h-4 w-4 mt-0.5 shrink-0 ${tip.tone === "primary" ? "text-primary" : tip.tone === "warning" ? "text-warning" : "text-accent"}`} />
                  <p className="text-xs leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Daily Goals */}
      <Card className="p-6 bg-gradient-card border-border/50">
        <h3 className="font-display font-semibold text-lg mb-5">Daily Goals</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Target, label: "Protein",
              val: todayProtein > 0 ? `${todayProtein}g / ${proteinGoal}g` : `0 / ${proteinGoal}g`,
              pct: Math.min((todayProtein / proteinGoal) * 100, 100),
              color: "primary"
            },
            {
              icon: Droplets, label: "Water",
              val: todayWaterL > 0 ? `${todayWaterL.toFixed(1)} / ${waterGoalL.toFixed(1)} L` : `0 / ${waterGoalL.toFixed(1)} L`,
              pct: Math.min((todayWaterL / waterGoalL) * 100, 100),
              color: "accent"
            },
            {
              icon: Heart, label: "Calories",
              val: todayCalories > 0 ? `${todayCalories.toLocaleString()} / ${calorieGoal.toLocaleString()} kcal` : `0 / ${calorieGoal.toLocaleString()} kcal`,
              pct: Math.min((todayCalories / calorieGoal) * 100, 100),
              color: "success"
            },
            {
              icon: Flame, label: "Streak",
              val: gamification.streak > 0 ? `${gamification.streak} days` : "No streak yet",
              pct: Math.min((gamification.streak / 30) * 100, 100),
              color: "primary"
            },
          ].map((g) => (
            <div key={g.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <g.icon className={`h-3.5 w-3.5 ${g.color === "primary" ? "text-primary" : g.color === "accent" ? "text-accent" : "text-success"}`} />
                  {g.label}
                </div>
                <div className="text-xs text-muted-foreground">{g.val}</div>
              </div>
              <Progress value={g.pct} className="h-1.5" />
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
};

// ── Empty state component ────────────────────────────────────────
function EmptyState({ icon: Icon, title, description, action, compact }: {
  icon: any; title: string; description: string;
  action?: { label: string; to: string }; compact?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-4" : "py-10"} space-y-3`}>
      <div className="h-12 w-12 rounded-full bg-surface-1 flex items-center justify-center">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      {action && (
        <Link to={action.to}>
          <Button variant="outline" size="sm">{action.label}</Button>
        </Link>
      )}
    </div>
  );
}

export default Dashboard;
