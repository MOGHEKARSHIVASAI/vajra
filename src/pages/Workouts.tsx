import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Play, Pause, RotateCcw, Plus, Minus, Check, Dumbbell,
  Zap, Timer, Flame, ChevronRight, Filter, Trash2
} from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { logWorkout } from "@/services/firestore";
import { EXERCISE_LIBRARY } from "@/utils/constants";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const muscleFilters = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"];

const muscleColors: Record<string, string> = {
  Chest: "border-primary/30",
  Back: "border-orange-500/30",
  Legs: "border-rose-500/30",
  Shoulders: "border-accent/30",
  Arms: "border-amber-500/30",
  Core: "border-sky-500/30",
  Cardio: "border-success/30",
};

const muscleIconColors: Record<string, string> = {
  Chest: "bg-primary/10 text-primary",
  Back: "bg-orange-500/10 text-orange-400",
  Legs: "bg-rose-500/10 text-rose-400",
  Shoulders: "bg-accent/10 text-accent",
  Arms: "bg-amber-500/10 text-amber-400",
  Core: "bg-sky-500/10 text-sky-400",
  Cardio: "bg-success/10 text-success",
};

interface SetRow { reps: number; weight: number; rpe?: number; done: boolean; }

interface WorkoutExercise {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  sets: SetRow[];
}

function RestTimer() {
  const [secs, setSecs] = useState(90);
  const [running, setRunning] = useState(false);
  const ref = useRef<any>();

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
      </div>
    </Card>
  );
}

const Workouts = () => {
  const { user } = useUserData();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [isFinishing, setIsFinishing] = useState(false);
  const [sessionExercises, setSessionExercises] = useState<WorkoutExercise[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [isStarted, setIsStarted] = useState(false);
  const SESSION_KEY = "active_workout_session";
  const EXPIRATION_TIME = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

  // 1. Load session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const { exercises, start, started } = JSON.parse(savedSession);
        const startTimeDate = new Date(start);
        const now = new Date();

        // Check if session is still valid (not expired)
        if (started && (now.getTime() - startTimeDate.getTime()) < EXPIRATION_TIME) {
          setSessionExercises(exercises);
          setStartTime(startTimeDate);
          setIsStarted(true);
        } else {
          // Session expired, clear it
          localStorage.removeItem(SESSION_KEY);
        }
      } catch (e) {
        console.error("Failed to load session", e);
      }
    }
  }, []);

  // 2. Save session on any change
  useEffect(() => {
    if (isStarted && startTime) {
      const sessionData = {
        exercises: sessionExercises,
        start: startTime.toISOString(),
        started: isStarted
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    }
  }, [sessionExercises, startTime, isStarted]);

  useEffect(() => {
    if (!isStarted || !startTime) {
      setElapsed("00:00");
      return;
    }
    const itv = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setElapsed(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(itv);
  }, [isStarted, startTime]);

  const handleStartWorkout = () => {
    setIsStarted(true);
    setStartTime(new Date());
    toast.info("Workout session started!");
  };

  const addExerciseToSession = (ex: any) => {
    const newEx: WorkoutExercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: ex.name,
      muscle: ex.muscle,
      equipment: ex.equipment,
      sets: [{ reps: 10, weight: 0, done: false }]
    };
    setSessionExercises([...sessionExercises, newEx]);
    toast.success(`Added ${ex.name} to session`);
  };

  const removeExerciseFromSession = (id: string) => {
    setSessionExercises(sessionExercises.filter(e => e.id !== id));
  };

  const updateSet = (exId: string, setIdx: number, data: Partial<SetRow>) => {
    setSessionExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const newSets = [...ex.sets];
      newSets[setIdx] = { ...newSets[setIdx], ...data };
      return { ...ex, sets: newSets };
    }));
  };

  const addSet = (exId: string) => {
    setSessionExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      return { ...ex, sets: [...ex.sets, { ...lastSet, done: false }] };
    }));
  };

  const handleFinishWorkout = async () => {
    if (!user) {
      toast.error("You must be logged in to save workouts.");
      return;
    }
    if (sessionExercises.length === 0) {
      toast.error("Add at least one exercise to finish.");
      return;
    }

    setIsFinishing(true);
    try {
      const totalVolume = sessionExercises.reduce((total, ex) => {
        return total + ex.sets.reduce((st, s) => st + (s.done ? (s.reps * s.weight) : 0), 0);
      }, 0);

      const duration = startTime ? Math.floor((new Date().getTime() - startTime.getTime()) / 60000) : 0;

      await logWorkout(user.uid, {
        name: "Gym Session",
        date: new Date().toISOString().split("T")[0],
        totalVolume,
        duration,
        exercises: sessionExercises,
        xpEarned: Math.min(250, 50 + Math.floor(totalVolume / 100))
      });
      
      toast.success(`Workout saved! +${Math.min(250, 50 + Math.floor(totalVolume / 100))} XP`);
      localStorage.removeItem(SESSION_KEY); // Clear session
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error saving workout:", error);
      toast.error("Failed to save: " + (error.message || "Unknown error"));
    } finally {
      setIsFinishing(false);
    }
  };

  const filtered = EXERCISE_LIBRARY.filter(
    (e) => (filter === "All" || e.muscle === filter) && e.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalVolume = sessionExercises.reduce((total, ex) => {
    return total + ex.sets.reduce((st, s) => st + (s.done ? (s.reps * s.weight) : 0), 0);
  }, 0);

  const setsDone = sessionExercises.reduce((total, ex) => {
    return total + ex.sets.filter(s => s.done).length;
  }, 0);

  const totalSets = sessionExercises.reduce((total, ex) => total + ex.sets.length, 0);

  return (
    <DashboardLayout
      title="Workouts"
      subtitle={isStarted ? `Active session · ${elapsed} elapsed · ${sessionExercises.length} exercises` : "Ready to train?"}
      action={
        isStarted && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (window.confirm("Are you sure you want to cancel this session? All progress will be lost.")) {
                  setIsStarted(false);
                  setSessionExercises([]);
                  setStartTime(null);
                  localStorage.removeItem(SESSION_KEY);
                  toast.info("Session cancelled");
                }
              }}
              disabled={isFinishing}
            >
              Cancel
            </Button>
            <Button variant="hero" size="sm" onClick={handleFinishWorkout} disabled={isFinishing}>
              {isFinishing ? "Saving..." : <><Flame className="h-4 w-4" /> Finish</>}
            </Button>
          </div>
        )
      }
    >
      {!isStarted ? (
        <Card className="relative overflow-hidden bg-gradient-card border-border/50 p-12 text-center">
          <div className="absolute inset-0 bg-gradient-radial-glow opacity-20" />
          <div className="relative z-10">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <h2 className="font-display text-3xl font-bold mb-2">Ready for your workout?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start your session to track sets, reps, and volume in real-time. Your progress will be saved to your profile.
            </p>
            <Button size="lg" variant="hero" className="px-12 py-6 text-lg" onClick={handleStartWorkout}>
              <Play className="h-5 w-5 mr-2" /> Start Session
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card className="relative overflow-hidden bg-gradient-ember border-0 p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,transparent,rgba(0,0,0,0.5))]" />
        <div className="relative grid sm:grid-cols-4 gap-6 items-center">
          <div>
            <div className="text-xs text-primary-foreground/80 uppercase tracking-widest">Active Session</div>
            <div className="font-display text-2xl font-bold text-primary-foreground">{elapsed}</div>
          </div>
          {[
            { label: "Volume", value: `${totalVolume.toLocaleString()} kg`, icon: Dumbbell },
            { label: "Sets done", value: `${setsDone} / ${totalSets}`, icon: Zap },
            { label: "Exercises", value: sessionExercises.length, icon: ChevronRight },
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
        <div className="lg:col-span-2 space-y-4">
          {sessionExercises.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-border/60 bg-surface-1/50">
              <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="font-display text-xl font-bold">No exercises added</h3>
              <p className="text-muted-foreground text-sm mt-2">Click an exercise from the library below to start tracking.</p>
            </Card>
          ) : (
            sessionExercises.map((ex) => (
              <Card key={ex.id} className={`p-6 bg-gradient-card border-l-4 ${muscleColors[ex.muscle] || "border-border/50"}`}>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-display text-xl font-bold">{ex.name}</h3>
                    <p className={`text-xs mt-1 font-semibold uppercase tracking-wider ${muscleIconColors[ex.muscle]?.split(" ")[1] || "text-muted-foreground"}`}>
                      {ex.muscle} · {ex.equipment}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeExerciseFromSession(ex.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <div className="col-span-1">Set</div>
                    <div className="col-span-3">Weight</div>
                    <div className="col-span-3">Reps</div>
                    <div className="col-span-2">RPE</div>
                    <div className="col-span-3 text-right">Done</div>
                  </div>
                  {ex.sets.map((s, i) => (
                    <div key={i} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg border transition-all ${s.done ? "bg-success/5 border-success/30" : "bg-surface-1 border-border/40"}`}>
                      <div className="col-span-1 font-bold text-sm">{i + 1}</div>
                      <div className="col-span-3 flex items-center gap-1">
                        <Input 
                          type="number" 
                          value={s.weight} 
                          onChange={(e) => updateSet(ex.id, i, { weight: Number(e.target.value) })}
                          onFocus={(e) => e.target.select()}
                          className="h-8 text-center bg-surface-2 border-border/40 px-1" 
                        />
                      </div>
                      <div className="col-span-3 flex items-center gap-1">
                        <Input 
                          type="number" 
                          value={s.reps} 
                          onChange={(e) => updateSet(ex.id, i, { reps: Number(e.target.value) })}
                          onFocus={(e) => e.target.select()}
                          className="h-8 text-center bg-surface-2 border-border/40 px-1" 
                        />
                      </div>
                      <div className="col-span-2">
                        <Input 
                          type="number" 
                          min={1} max={10}
                          placeholder="RPE"
                          value={s.rpe || ""} 
                          onChange={(e) => updateSet(ex.id, i, { rpe: Number(e.target.value) })}
                          className="h-8 text-center bg-surface-2 border-border/40 px-1 text-[10px]" 
                        />
                      </div>
                      <div className="col-span-3 flex justify-end">
                        <button
                          onClick={() => updateSet(ex.id, i, { done: !s.done })}
                          className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${s.done ? "bg-gradient-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground"}`}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4 h-8 text-xs" onClick={() => addSet(ex.id)}>
                  <Plus className="h-3 w-3 mr-1" /> Add set
                </Button>
              </Card>
            ))
          )}
        </div>
        <div className="space-y-6">
          <RestTimer />
        </div>
      </div>

      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="font-display font-semibold text-lg">Exercise Library</h3>
            <p className="text-xs text-muted-foreground">Click to add to session</p>
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
            <button 
              key={ex.name} 
              onClick={() => addExerciseToSession(ex)} 
              className={`group text-left p-4 rounded-xl bg-surface-1 border transition-all hover:shadow-glow-sm ${muscleColors[ex.muscle] || "border-border/40"} hover:border-foreground/20`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${muscleIconColors[ex.muscle] || "bg-primary/10 text-primary"}`}>
                  <Dumbbell className="h-4 w-4" />
                </div>
                <Badge variant="outline" className="text-[10px] border-border/50">{ex.difficulty || "Beginner"}</Badge>
              </div>
              <div className="font-semibold text-sm">{ex.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{ex.muscle} · {ex.equipment}</div>
            </button>
          ))}
        </div>
      </Card>
        </>
      )}
    </DashboardLayout>
  );
};

export default Workouts;
