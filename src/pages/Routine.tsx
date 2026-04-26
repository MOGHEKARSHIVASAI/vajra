import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, Plus, X, Bell, Save, Flame, Clock, 
  Dumbbell, Activity, Calendar, Sparkles, ChevronRight
} from "lucide-react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/services/firebase";
import { updateUserProfile, getUserProfile } from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
type Day = typeof DAYS[number];

const PRESETS = [
  "Push", "Pull", "Legs", "Upper", "Lower", "Full Body", "Cardio", "Mobility", "Rest",
];

const PRESET_COLORS: Record<string, string> = {
  Push: "bg-primary/15 border-primary/40 text-primary",
  Pull: "bg-orange-500/15 border-orange-500/40 text-orange-300",
  Legs: "bg-rose-500/15 border-rose-500/40 text-rose-300",
  Upper: "bg-accent/15 border-accent/40 text-accent",
  Lower: "bg-amber-500/15 border-amber-500/40 text-amber-300",
  "Full Body": "bg-indigo-500/15 border-indigo-500/40 text-indigo-300",
  Cardio: "bg-success/15 border-success/40 text-success",
  Mobility: "bg-sky-500/15 border-sky-500/40 text-sky-300",
  Rest: "bg-surface-2 border-border/40 text-muted-foreground",
};

const Routine = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [routine, setRoutine] = useState<Record<Day, string[]>>({
    MON: ["Push"],
    TUE: ["Pull"],
    WED: ["Legs"],
    THU: ["Rest"],
    FRI: ["Upper"],
    SAT: ["Lower"],
    SUN: ["Rest"],
  });
  const [time, setTime] = useState("18:00");
  const [reminder, setReminder] = useState(true);
  const [duration, setDuration] = useState(60);
  const [name, setName] = useState("VAJRA Alpha 1");
  const [customLabel, setCustomLabel] = useState("");

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setLoading(true);
        const profile = await getUserProfile(u.uid);
        if (profile && profile.routine) {
          setRoutine(profile.routine.schedule || routine);
          setTime(profile.routine.time || "18:00");
          setReminder(profile.routine.reminder !== false);
          setDuration(profile.routine.duration || 60);
          setName(profile.routine.name || "VAJRA Alpha 1");
        }
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const handleAdd = (day: Day, label: string) => {
    setRoutine((r) => ({
      ...r,
      [day]: r[day][0] === "Rest" ? [label] : [...r[day], label].filter(x => x !== "Rest"),
    }));
  };

  const handleRemove = (day: Day, idx: number) => {
    setRoutine((r) => {
      const newItems = r[day].filter((_, i) => i !== idx);
      return { ...r, [day]: newItems.length === 0 ? ["Rest"] : newItems };
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        routine: {
          schedule: routine,
          time,
          reminder,
          duration,
          name,
          updatedAt: new Date().toISOString(),
        }
      });
      toast({
        title: "Routine Saved!",
        description: "Your weekly training schedule has been synced.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save your routine.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const trainingDays = DAYS.filter((d) => !routine[d].every((x) => x === "Rest")).length;
  const totalWeeklyMinutes = trainingDays * duration;

  if (loading) {
    return (
      <DashboardLayout title="Routine Builder" subtitle="Syncing your schedule...">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Routine Builder"
      subtitle="Design your weekly volume and lock in your schedule"
      action={
        <Button variant="hero" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <><div className="h-3 w-3 border-2 border-current border-t-transparent animate-spin mr-2" /> Saving</> : <><Save className="h-4 w-4 mr-2" /> Sync Routine</>}
        </Button>
      }
    >
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Main Content */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                 <CalendarDays className="h-5 w-5 text-primary" />
               </div>
               <div>
                 <h2 className="font-display text-xl font-bold uppercase tracking-tight">The Weekly Grind</h2>
                 <p className="text-xs text-muted-foreground">{trainingDays} training sessions scheduled this week</p>
               </div>
             </div>
             <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-3 py-1">
               {name}
             </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {DAYS.map((day) => (
              <Dialog key={day}>
                <DialogTrigger asChild>
                  <Card className="flex flex-col h-full bg-gradient-card border-border/50 hover:border-primary/30 transition-all group min-h-[180px] cursor-pointer hover:shadow-glow-sm">
                    <div className="p-3 border-b border-border/30 flex items-center justify-between bg-surface-1/50">
                      <span className="font-display font-bold text-lg text-primary">{day}</span>
                      <Plus className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    
                    <div className="flex-1 p-3 space-y-2">
                      {routine[day].map((label, i) => (
                        <div 
                          key={i} 
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${PRESET_COLORS[label] || "bg-primary/20 border-primary/40 text-primary"}`}
                        >
                          <span>{label}</span>
                          {label !== "Rest" && <ChevronRight className="h-2.5 w-2.5 opacity-50" />}
                        </div>
                      ))}
                    </div>
                    <div className="p-2 text-[8px] text-center text-muted-foreground uppercase tracking-widest border-t border-border/20 group-hover:text-primary transition-colors">
                      Click to edit
                    </div>
                  </Card>
                </DialogTrigger>
                <DialogContent className="bg-popover border-border/50 shadow-2xl sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Edit {day} Routine
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="py-4 space-y-6">
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground">Active Sessions</Label>
                      <div className="flex flex-wrap gap-2">
                        {routine[day].map((label, i) => (
                          <Badge 
                            key={i} 
                            className={`px-3 py-1.5 flex items-center gap-2 border ${PRESET_COLORS[label] || "bg-primary/20 border-primary/40 text-primary"}`}
                          >
                            {label}
                            {label !== "Rest" && (
                              <X 
                                className="h-3 w-3 cursor-pointer hover:text-white" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemove(day, i);
                                }}
                              />
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border/30">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground">Add Preset Workout</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {PRESETS.filter(p => p !== "Rest").map((p) => (
                          <Button
                            key={p}
                            variant="outline"
                            size="sm"
                            className="text-[10px] font-bold uppercase border-border/40 hover:bg-primary/10 hover:border-primary/30"
                            onClick={() => handleAdd(day, p)}
                          >
                            {p}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] font-bold uppercase border-destructive/20 hover:bg-destructive/10 text-destructive"
                          onClick={() => {
                            setRoutine(r => ({ ...r, [day]: ["Rest"] }));
                          }}
                        >
                          Set to Rest
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border/30">
                      <Label className="text-xs uppercase tracking-widest text-muted-foreground">Custom Workout Type</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="e.g. Swimming, MMA, HIIT..." 
                          className="bg-surface-1 border-border/40"
                          value={customLabel}
                          onChange={(e) => setCustomLabel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customLabel) {
                              handleAdd(day, customLabel);
                              setCustomLabel("");
                            }
                          }}
                        />
                        <Button 
                          variant="hero"
                          className="shrink-0" 
                          onClick={() => {
                            if (customLabel) {
                              handleAdd(day, customLabel);
                              setCustomLabel("");
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="p-6 bg-gradient-card border-border/50">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Weekly Intensity</div>
                <div className="font-display text-4xl font-bold gradient-text">{trainingDays} <span className="text-sm font-sans font-medium text-muted-foreground uppercase tracking-widest ml-1">Sessions</span></div>
                <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest leading-relaxed">
                   Average of {(trainingDays/7).toFixed(1)} sessions per day
                </p>
             </Card>

             <Card className="p-6 bg-gradient-card border-border/50">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Time Commitment</div>
                <div className="font-display text-4xl font-bold">{totalWeeklyMinutes} <span className="text-sm font-sans font-medium text-muted-foreground uppercase tracking-widest ml-1">Min / Wk</span></div>
                <div className="flex items-center gap-1.5 mt-2">
                   <Clock className="h-3 w-3 text-primary" />
                   <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                     ~{Math.round(totalWeeklyMinutes / 60)} hours total
                   </span>
                </div>
             </Card>

             <Card className="p-6 bg-gradient-card border-border/50">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Status Check</div>
                <div className="font-display text-4xl font-bold">{trainingDays >= 4 ? "Elite" : "Active"}</div>
                <div className="flex gap-1 mt-3">
                   {Array.from({ length: 7 }).map((_, i) => (
                     <div key={i} className={`h-1.5 flex-1 rounded-full ${i < trainingDays ? "bg-primary" : "bg-surface-2"}`} />
                   ))}
                </div>
             </Card>
          </div>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-card border-border/50 sticky top-24">
            <h2 className="font-display text-xl font-bold uppercase mb-6 flex items-center gap-2">
               <Activity className="h-5 w-5 text-primary" /> Routine Specs
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Routine Identifier</Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="bg-surface-1 border-border/40 font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Avg. Session Duration (Min)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    min={20} max={180} 
                    value={duration} 
                    onChange={(e) => setDuration(+e.target.value)} 
                    className="pl-10 bg-surface-1 border-border/40" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Daily Activation Time</Label>
                <div className="relative">
                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input 
                    type="time" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)} 
                    className="pl-10 bg-surface-1 border-border/40" 
                  />
                </div>
              </div>

              <div className="pt-2">
                 <button
                   onClick={() => setReminder(!reminder)}
                   className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${reminder ? "border-primary/50 bg-primary/10 shadow-glow-sm" : "border-border/40 bg-surface-1"}`}
                 >
                   <div className="flex items-center gap-3">
                     <Bell className={`h-4 w-4 ${reminder ? "text-primary" : "text-muted-foreground"}`} />
                     <span className="text-xs font-bold uppercase tracking-wider">Push Reminders</span>
                   </div>
                   <div className={`w-10 h-5 rounded-full p-1 transition-colors ${reminder ? "bg-primary" : "bg-surface-3"}`}>
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${reminder ? "translate-x-5" : ""}`} />
                   </div>
                 </button>
              </div>

              <div className="bg-surface-1/50 border border-border/40 rounded-xl p-4 mt-4">
                <div className="flex gap-3">
                   <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                   <p className="text-[10px] text-muted-foreground leading-relaxed">
                     <span className="text-foreground font-bold uppercase tracking-widest block mb-1">PRO TIP</span>
                     Balance your volume across the week to ensure muscle recovery groups aren't overloaded.
                   </p>
                </div>
              </div>

              <Button variant="hero" size="lg" className="w-full mt-4 group" onClick={handleSave} disabled={saving}>
                {saving ? "Syncing..." : <><Save className="h-4 w-4 mr-2" /> Lock in Routine</>}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Routine;
