import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Play, Pause, RotateCcw, Plus, Minus, Check, Dumbbell,
  Zap, Timer, Flame, ChevronRight, Filter,
} from "lucide-react";

const exerciseLib = [
  { name: "Bench Press", muscle: "Chest", equip: "Barbell", diff: "Intermediate" },
  { name: "Squat", muscle: "Legs", equip: "Barbell", diff: "Intermediate" },
  { name: "Deadlift", muscle: "Back", equip: "Barbell", diff: "Advanced" },
  { name: "Overhead Press", muscle: "Shoulders", equip: "Barbell", diff: "Intermediate" },
  { name: "Pull-up", muscle: "Back", equip: "Bodyweight", diff: "Intermediate" },
  { name: "Dumbbell Row", muscle: "Back", equip: "Dumbbell", diff: "Beginner" },
  { name: "Bicep Curl", muscle: "Arms", equip: "Dumbbell", diff: "Beginner" },
  { name: "Lateral Raise", muscle: "Shoulders", equip: "Dumbbell", diff: "Beginner" },
  { name: "Leg Press", muscle: "Legs", equip: "Machine", diff: "Beginner" },
  { name: "Romanian Deadlift", muscle: "Legs", equip: "Barbell", diff: "Intermediate" },
];

const muscleFilters = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

interface SetRow { reps: number; weight: number; done: boolean; }

function RestTimer() {
  const [secs, setSecs] = useState(90);
  const [running, setRunning] = useState(false);
  const ref = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (running && secs > 0) {
      ref.current = setTimeout(() => setSecs((s) => s - 1), 1000);
    } else if (secs === 0) {
      setRunning(false);
    }
    return () => clearTimeout(ref.current);
  }, [running, secs]);

  const pct = (secs / 90) * 100;
  const r = 60;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <Card className="p-6 bg-gradient-card border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial-glow opacity-50" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Timer className="h-4 w-4 text-primary" />
          <h3 className="font-display font-semibold text-sm">Rest Timer</h3>
        </div>
        <div className="relative w-44 h-44 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={r} stroke="hsl(var(--border))" strokeWidth="6" fill="none" />
            <circle
              cx="70" cy="70" r={r}
              stroke="url(#restGrad)"
              strokeWidth="6" fill="none"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="restGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-display text-4xl font-bold gradient-text tabular-nums">
              {String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">remaining</div>
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-5">
          <Button size="icon" variant="outline" onClick={() => setSecs(90)}><RotateCcw className="h-4 w-4" /></Button>
          <Button variant="hero" onClick={() => setRunning((r) => !r)} className="px-6">
            {running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Start</>}
          </Button>
          <Button size="icon" variant="outline" onClick={() => setSecs((s) => Math.min(s + 30, 600))}><Plus className="h-4 w-4" /></Button>
        </div>
        <div className="flex justify-center gap-2 mt-3 text-xs">
          {[60, 90, 120, 180].map((t) => (
            <button key={t} onClick={() => setSecs(t)} className="px-2 py-1 rounded-md bg-surface-1 hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-colors">
              {t}s
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

function ActiveExercise() {
  const [sets, setSets] = useState<SetRow[]>([
    { reps: 8, weight: 85, done: true },
    { reps: 8, weight: 85, done: true },
    { reps: 7, weight: 85, done: false },
    { reps: 6, weight: 85, done: false },
  ]);

  const toggleSet = (i: number) => setSets((s) => s.map((row, idx) => idx === i ? { ...row, done: !row.done } : row));
  const addSet = () => setSets((s) => [...s, { reps: 8, weight: 85, done: false }]);

  return (
    <Card className="p-6 bg-gradient-card border-border/50">
      <div className="flex items-start justify-between mb-5">
        <div>
          <Badge className="mb-2 bg-primary/15 text-primary border-primary/30">Exercise 3 of 5</Badge>
          <h3 className="font-display text-2xl font-bold">Bench Press</h3>
          <p className="text-xs text-muted-foreground mt-1">Chest · Barbell · Last PR: 90kg × 5</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Volume</div>
          <div className="font-display text-xl font-bold gradient-text">2,380 kg</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          <div className="col-span-1">Set</div>
          <div className="col-span-3">Previous</div>
          <div className="col-span-3">Weight (kg)</div>
          <div className="col-span-3">Reps</div>
          <div className="col-span-2 text-right">Done</div>
        </div>
        {sets.map((s, i) => (
          <div key={i} className={`grid grid-cols-12 gap-2 items-center p-3 rounded-lg border transition-all ${s.done ? "bg-success/5 border-success/30" : "bg-surface-1 border-border/40 hover:border-primary/30"}`}>
            <div className="col-span-1 font-bold text-sm">{i + 1}</div>
            <div className="col-span-3 text-xs text-muted-foreground">85kg × 8</div>
            <div className="col-span-3 flex items-center gap-1">
              <button className="h-6 w-6 rounded bg-surface-2 flex items-center justify-center hover:bg-surface-3"><Minus className="h-3 w-3" /></button>
              <Input value={s.weight} className="h-8 text-center bg-surface-2 border-border/40 px-1" readOnly />
              <button className="h-6 w-6 rounded bg-surface-2 flex items-center justify-center hover:bg-surface-3"><Plus className="h-3 w-3" /></button>
            </div>
            <div className="col-span-3 flex items-center gap-1">
              <button className="h-6 w-6 rounded bg-surface-2 flex items-center justify-center hover:bg-surface-3"><Minus className="h-3 w-3" /></button>
              <Input value={s.reps} className="h-8 text-center bg-surface-2 border-border/40 px-1" readOnly />
              <button className="h-6 w-6 rounded bg-surface-2 flex items-center justify-center hover:bg-surface-3"><Plus className="h-3 w-3" /></button>
            </div>
            <div className="col-span-2 flex justify-end">
              <button
                onClick={() => toggleSet(i)}
                className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${s.done ? "bg-gradient-primary text-primary-foreground shadow-glow-sm" : "bg-surface-2 text-muted-foreground hover:bg-surface-3"}`}
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <Button variant="outline" className="flex-1" onClick={addSet}><Plus className="h-4 w-4" /> Add set</Button>
        <Button variant="hero" className="flex-1">Next exercise <ChevronRight className="h-4 w-4" /></Button>
      </div>
    </Card>
  );
}

const Workouts = () => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = exerciseLib.filter(
    (e) => (filter === "All" || e.muscle === filter) && e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Workouts"
      subtitle="Active session · 14:32 elapsed · 2 of 5 done"
      action={<Button variant="hero" size="sm"><Flame className="h-4 w-4" /> Finish</Button>}
    >
      {/* Session header */}
      <Card className="relative overflow-hidden bg-gradient-ember border-0 p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,transparent,rgba(0,0,0,0.5))]" />
        <div className="relative grid sm:grid-cols-4 gap-6 items-center">
          <div>
            <div className="text-xs text-primary-foreground/80 uppercase tracking-widest">Push Day</div>
            <div className="font-display text-2xl font-bold text-primary-foreground">Chest · Shoulders · Tris</div>
          </div>
          {[
            { label: "Elapsed", value: "14:32", icon: Timer },
            { label: "Volume", value: "4,820 kg", icon: Dumbbell },
            { label: "Sets done", value: "11 / 18", icon: Zap },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary-foreground/15 flex items-center justify-center">
                <s.icon className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <div className="text-xs text-primary-foreground/70">{s.label}</div>
                <div className="font-display text-lg font-bold text-primary-foreground">{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActiveExercise />
        </div>
        <RestTimer />
      </div>

      {/* Exercise library */}
      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="font-display font-semibold text-lg">Exercise Library</h3>
            <p className="text-xs text-muted-foreground">{filtered.length} exercises</p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-surface-1 border-border/40 h-10"
              />
            </div>
            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
          {muscleFilters.map((m) => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filter === m ? "bg-gradient-primary text-primary-foreground shadow-glow-sm" : "bg-surface-1 text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((ex) => (
            <button key={ex.name} className="group text-left p-4 rounded-xl bg-surface-1 border border-border/40 hover:border-primary/40 hover:shadow-glow-sm transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Dumbbell className="h-4 w-4 text-primary" />
                </div>
                <Badge variant="outline" className="text-[10px] border-border/50">{ex.diff}</Badge>
              </div>
              <div className="font-semibold text-sm">{ex.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{ex.muscle} · {ex.equip}</div>
            </button>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default Workouts;
