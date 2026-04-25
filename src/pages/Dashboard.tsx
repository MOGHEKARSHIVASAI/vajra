import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { MuscleModel3D } from "@/components/MuscleModel3D";
import {
  Activity, Apple, Brain, Droplets, Flame, LineChart as LineIcon, Trophy,
  Dumbbell, Heart, Bell, Settings, LogOut, Plus, TrendingUp, Target,
  Calendar, ChevronRight, Sparkles, Moon, Zap,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart as RLineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const navItems = [
  { icon: Activity, label: "Overview", active: true },
  { icon: Dumbbell, label: "Workouts" },
  { icon: Apple, label: "Nutrition" },
  { icon: Droplets, label: "Hydration" },
  { icon: LineIcon, label: "Analytics" },
  { icon: Brain, label: "AI Coach" },
  { icon: Trophy, label: "Challenges" },
  { icon: Calendar, label: "Schedule" },
];

const strengthData = [
  { day: "Mon", bench: 80, squat: 110, dead: 140 },
  { day: "Tue", bench: 82, squat: 112, dead: 140 },
  { day: "Wed", bench: 82, squat: 115, dead: 145 },
  { day: "Thu", bench: 85, squat: 115, dead: 145 },
  { day: "Fri", bench: 85, squat: 117, dead: 150 },
  { day: "Sat", bench: 87, squat: 120, dead: 150 },
  { day: "Sun", bench: 90, squat: 120, dead: 155 },
];

const calorieData = [
  { day: "M", cal: 2400, goal: 2500 },
  { day: "T", cal: 2620, goal: 2500 },
  { day: "W", cal: 2300, goal: 2500 },
  { day: "T", cal: 2500, goal: 2500 },
  { day: "F", cal: 2700, goal: 2500 },
  { day: "S", cal: 2450, goal: 2500 },
  { day: "S", cal: 2340, goal: 2500 },
];

const muscleFreq = [
  { group: "Chest", count: 8 },
  { group: "Back", count: 7 },
  { group: "Legs", count: 5 },
  { group: "Shoulders", count: 6 },
  { group: "Arms", count: 9 },
  { group: "Core", count: 4 },
];

const Dashboard = () => {
  const [highlights] = useState(["chest", "arms", "shoulders"]);

  return (
    <div className="min-h-screen flex bg-background">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-border/50 bg-sidebar p-4 sticky top-0 h-screen">
        <div className="px-2 pb-6">
          <Logo size="md" />
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                item.active
                  ? "bg-gradient-primary text-primary-foreground shadow-glow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              }`}
            >
              <item.icon className="h-4 w-4" strokeWidth={2.2} />
              <span className="font-medium">{item.label}</span>
              {item.active && <ChevronRight className="ml-auto h-4 w-4" />}
            </button>
          ))}
        </nav>
        <div className="space-y-1 pt-4 border-t border-border/50">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors">
            <Settings className="h-4 w-4" /> Settings
          </button>
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors">
            <LogOut className="h-4 w-4" /> Log out
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 min-w-0">
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border/50 px-4 md:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold">Welcome back, Alex</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Wednesday · Push day · 5 exercises queued</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
            </Button>
            <Button variant="hero" size="sm">
              <Plus className="h-4 w-4" /> Log workout
            </Button>
            <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">A</div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6">
          {/* STAT ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Flame, label: "Streak", value: "42", unit: "days", color: "primary", trend: "+3" },
              { icon: Trophy, label: "Level", value: "24", unit: "Pro", color: "accent", trend: "+540 XP" },
              { icon: Heart, label: "Calories", value: "2,340", unit: "/ 2,500", color: "success", trend: "94%" },
              { icon: Droplets, label: "Water", value: "2.1", unit: "/ 3 L", color: "primary", trend: "70%" },
            ].map((s) => (
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

          {/* MAIN GRID */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Strength chart */}
            <Card className="lg:col-span-2 p-6 bg-gradient-card border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display font-semibold text-lg">Strength Progression</h3>
                  <p className="text-xs text-muted-foreground">Last 7 days · kilograms</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Bench</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /> Squat</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" /> Deadlift</span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RLineChart data={strengthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="bench" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="squat" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="dead" stroke="hsl(var(--success))" strokeWidth={2.5} dot={{ r: 3 }} />
                  </RLineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* 3D body */}
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

          {/* SECOND ROW */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calorie chart */}
            <Card className="p-6 bg-gradient-card border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display font-semibold text-lg">Calories vs Goal</h3>
                  <p className="text-xs text-muted-foreground">7-day intake</p>
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={calorieData}>
                    <defs>
                      <linearGradient id="calG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="cal" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#calG)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Muscle frequency */}
            <Card className="p-6 bg-gradient-card border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display font-semibold text-lg">Muscle Frequency</h3>
                  <p className="text-xs text-muted-foreground">Sessions this month</p>
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={muscleFreq}>
                    <XAxis dataKey="group" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} cursor={{ fill: "hsl(var(--primary) / 0.1)" }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* AI Coach */}
            <Card className="p-6 bg-gradient-card border-border/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-sm">AI Coach</h3>
                    <p className="text-xs text-muted-foreground">3 new insights</p>
                  </div>
                  <Sparkles className="h-3.5 w-3.5 text-primary ml-auto" />
                </div>
                <div className="space-y-3">
                  {[
                    { icon: Zap, text: "Bench PR likely in 5–7 days. Push intensity tomorrow.", tone: "primary" },
                    { icon: Apple, text: "You're 28g short on protein. Add a shake tonight.", tone: "warning" },
                    { icon: Moon, text: "Sleep avg 6.2h — recovery dipping. Aim 7.5h.", tone: "accent" },
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

          {/* TODAY WORKOUT + GOALS */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6 bg-gradient-card border-border/50">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display font-semibold text-lg">Today's Workout</h3>
                  <p className="text-xs text-muted-foreground">Push · Chest, Shoulders, Triceps</p>
                </div>
                <Button variant="hero" size="sm"><Plus className="h-4 w-4" /> Start</Button>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Bench Press", sets: "4 × 6–8", weight: "85 kg", done: true },
                  { name: "Overhead Press", sets: "4 × 8", weight: "55 kg", done: true },
                  { name: "Incline Dumbbell Press", sets: "3 × 10", weight: "32 kg", done: false },
                  { name: "Lateral Raises", sets: "3 × 12", weight: "12 kg", done: false },
                  { name: "Tricep Pushdowns", sets: "3 × 12", weight: "30 kg", done: false },
                ].map((ex) => (
                  <div key={ex.name} className="flex items-center gap-3 p-3 rounded-lg bg-surface-1 border border-border/40 hover:border-primary/30 transition-colors">
                    <div className={`h-6 w-6 rounded-md flex items-center justify-center text-xs font-bold ${ex.done ? "bg-success/20 text-success" : "bg-surface-3 text-muted-foreground"}`}>
                      {ex.done ? "✓" : "•"}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{ex.name}</div>
                      <div className="text-xs text-muted-foreground">{ex.sets}</div>
                    </div>
                    <div className="text-sm font-bold gradient-text">{ex.weight}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50">
              <h3 className="font-display font-semibold text-lg mb-5">Daily Goals</h3>
              <div className="space-y-5">
                {[
                  { icon: Target, label: "Protein", val: "142 / 170g", pct: 84, color: "primary" },
                  { icon: Droplets, label: "Water", val: "2.1 / 3 L", pct: 70, color: "accent" },
                  { icon: TrendingUp, label: "Steps", val: "7,820 / 10k", pct: 78, color: "success" },
                  { icon: Moon, label: "Sleep", val: "6.2 / 8 h", pct: 78, color: "primary" },
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
