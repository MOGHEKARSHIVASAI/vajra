import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Dumbbell, Apple, Moon, Coffee, Clock, Flame, Activity, X, Droplets, Utensils, Zap } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logEvent } from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_FULL = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

interface Event {
  day: string;
  start: number; // hour 0-24
  duration: number; // hours
  title: string;
  type: "workout" | "meal" | "sleep" | "rest";
  detail: string;
}

const typeStyle: Record<string, string> = {
  workout: "bg-gradient-primary text-primary-foreground border-primary/40 shadow-glow-sm",
  push: "bg-gradient-primary text-primary-foreground border-primary/40 shadow-glow-sm",
  pull: "bg-orange-500/20 text-orange-200 border-orange-500/40",
  legs: "bg-rose-500/20 text-rose-200 border-rose-500/40",
  cardio: "bg-success/20 text-success border-success/40",
  mobility: "bg-sky-500/20 text-sky-200 border-sky-500/40",
  meal: "bg-accent/20 text-accent border-accent/40",
  sleep: "bg-surface-3 text-muted-foreground border-border",
  rest: "bg-surface-2 text-muted-foreground border-border",
};

const typeIcon: Record<string, any> = {
  workout: Dumbbell,
  push: Dumbbell,
  pull: Dumbbell,
  legs: Dumbbell,
  cardio: Flame,
  mobility: Activity,
  meal: Apple,
  sleep: Moon,
  rest: Coffee,
  cheat: Utensils,
  event: Zap
};

const Schedule = () => {
  const { profile, recentWorkouts, weekNutrition, weekWater, calendarEvents, sleepLogs, loading } = useUserData();
  const [view, setView] = useState<"routine" | "calendar">("routine");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const hours = Array.from({ length: 19 }, (_, i) => i + 4); // 4am - 10pm

  const routine = profile?.routine?.schedule || {};
  const routineTime = profile?.routine?.time || "18:00";
  const [h, m] = routineTime.split(":").map(Number);
  const startHour = (h || 0) + ((m || 0) / 60);
  const duration = (profile?.routine?.duration || 60) / 60;

  // Derive events from routine
  const events: Event[] = [];
  DAYS_FULL.forEach((day) => {
    const sessions = routine[day] || [];
    sessions.forEach((s: string, sessionIdx: number) => {
      // Stagger sessions if multiple exist, but if they are the same type/name, maybe user doesn't want duplicates?
      // For now, let's just fix the time logic.
      const sessionStart = startHour + (sessionIdx * (duration + 0.25)); 
      
      const labelLower = s.toLowerCase();
      const eventType = typeStyle[labelLower] ? labelLower : (s === "Rest" ? "rest" : "workout");

      events.push({
        day: day,
        start: sessionStart,
        duration: duration,
        title: s,
        type: eventType as any,
        detail: s === "Rest" ? "Recovery" : "Scheduled Session"
      });
    });
  });

  const stats = {
    workouts: events.filter((e) => !["rest", "meal", "sleep"].includes(e.type)).length,
    duration: events.filter((e) => !["rest", "meal", "sleep"].includes(e.type)).reduce((s, e) => s + e.duration, 0),
  };

  return (
    <DashboardLayout
      title="Schedule"
      subtitle={`${stats.workouts} weekly sessions planned · ${profile?.routine?.name || "No routine"}`}
      action={
        <Button variant="hero" size="sm" onClick={() => window.location.href = '/routine'}>
          <Plus className="h-4 w-4 mr-2" /> Modify Routine
        </Button>
      }
    >
      <div className="flex items-center gap-2 mb-6 bg-surface-1 p-1 rounded-xl w-fit border border-border/50">
        <button 
          onClick={() => setView("routine")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === "routine" ? "bg-gradient-primary text-primary-foreground shadow-glow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Weekly Routine
        </button>
        <button 
          onClick={() => setView("calendar")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === "calendar" ? "bg-gradient-primary text-primary-foreground shadow-glow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Monthly Calendar
        </button>
      </div>

      {view === "routine" ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Dumbbell, label: "Workouts", val: `${stats.workouts}`, sub: "this week", tone: "primary" },
              { icon: Clock, label: "Total time", val: `${stats.duration.toFixed(1)}h`, sub: "training", tone: "accent" },
              { icon: Flame, label: "Volume Goal", val: "TBD", sub: "kg", tone: "warning" },
              { icon: Flame, label: "Intensity", val: "High", sub: "target", tone: "primary" },
            ].map((s) => (
              <Card key={s.label} className="p-5 bg-gradient-card border-border/50">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.tone === "primary" ? "bg-primary/15 text-primary" : s.tone === "accent" ? "bg-accent/15 text-accent" : "bg-warning/15 text-warning"}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className="font-display text-xl font-bold">{s.val} <span className="text-xs font-normal text-muted-foreground">{s.sub}</span></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
            <div>
              <h3 className="font-display font-semibold text-lg">Weekly Routine</h3>
              <p className="text-xs text-muted-foreground">Based on your routine builder</p>
            </div>
            <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-2 mb-3">
              <div />
              {DAYS_SHORT.map((d, i) => {
                const isToday = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase() === d.toUpperCase();
                return (
                  <div key={d} className={`text-center p-2 rounded-lg transition-colors ${isToday ? "bg-primary/10 text-primary" : ""}`}>
                    <div className="text-[10px] uppercase tracking-widest font-bold">{d}</div>
                  </div>
                );
              })}
            </div>

            <div className="relative grid grid-cols-[60px_repeat(7,1fr)] gap-2">
              {hours.map((h) => (
                <React.Fragment key={`slot-${h}`}>
                  <div className="text-[10px] text-muted-foreground text-right pr-2 -mt-1.5 font-medium">
                    {h === 12 ? "12 PM" : h < 12 ? `${h} AM` : `${h - 12} PM`}
                  </div>
                  {DAYS_FULL.map((d) => (
                    <div key={`${h}-${d}`} className="h-12 border-t border-border/30 relative hover:bg-surface-1/30 transition-colors" />
                  ))}
                </React.Fragment>
              ))}

              {events.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
                  <CalendarIcon className="h-16 w-16 mb-4" />
                  <p className="font-display text-xl font-bold">No sessions scheduled</p>
                </div>
              ) : (
                events.map((e, idx) => {
                  const colIndex = DAYS_FULL.indexOf(e.day);
                  if (colIndex < 0) return null;
                  const top = (e.start - 4) * 48 + 4;
                  const height = e.duration * 48 - 6;
                  const Icon = typeIcon[e.type];
                  return (
                    <div
                      key={idx}
                      onClick={() => window.location.href = '/routine'}
                      className={`absolute rounded-xl p-3 border text-xs cursor-pointer transition-all hover:scale-[1.02] hover:z-10 hover:shadow-glow-md flex flex-col justify-between group ${typeStyle[e.type]}`}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        left: `calc(60px + ${(colIndex / 7) * 100}% + ${colIndex * 8 / 7}px)`,
                        width: `calc(${100 / 7}% - 8px)`,
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold truncate">
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate uppercase tracking-tight">{e.title}</span>
                        </div>
                        {height > 50 && <div className="text-[10px] opacity-80 mt-1 truncate font-medium">{e.detail}</div>}
                      </div>
                      {height > 40 && (
                        <div className="flex items-center justify-end">
                          <Badge variant="outline" className="text-[9px] border-current/20 bg-current/5 px-1.5 h-4">
                            {e.duration * 60}m
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </Card>
    </>
      ) : (
        <MonthlyCalendar 
          currentMonth={currentMonth} 
          setCurrentMonth={setCurrentMonth}
          recentWorkouts={recentWorkouts}
          weekNutrition={weekNutrition}
          weekWater={weekWater}
          calendarEvents={calendarEvents}
          sleepLogs={sleepLogs}
          profile={profile}
        />
      )}
    </DashboardLayout>
  );
};

function MonthlyCalendar({ currentMonth, setCurrentMonth, recentWorkouts, weekNutrition, weekWater, calendarEvents, sleepLogs, profile }: any) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }); // Adjust for Mon start

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const getLogsForDate = (dateStr: string) => {
    const workouts = recentWorkouts.filter((w: any) => {
      if (w.date) return w.date === dateStr;
      if (w.createdAt) {
        const d = w.createdAt.toDate ? w.createdAt.toDate() : new Date(w.createdAt);
        // Get local date string YYYY-MM-DD
        const localDate = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        return localDate === dateStr;
      }
      return false;
    });
    const nutrition = weekNutrition.find((l: any) => l.date === dateStr);
    const water = weekWater.find((l: any) => l.date === dateStr);
    const events = calendarEvents?.filter((e: any) => e.date === dateStr) || [];
    const sleep = sleepLogs?.find((l: any) => l.date === dateStr);
    return { workouts, nutrition, water, events, sleep };
  };

  const selectedData = selectedDate ? getLogsForDate(selectedDate) : null;

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight">{monthName} {currentMonth.getFullYear()}</h3>
            <p className="text-xs text-muted-foreground">Historical activity & upcoming events</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
            <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
            <div key={d} className="text-center text-[10px] uppercase tracking-widest font-bold text-muted-foreground py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {padding.map((_, i) => <div key={`p-${i}`} className="aspect-square opacity-20" />)}
          {days.map(d => {
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const todayObj = new Date();
            const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const { workouts, nutrition, water, sleep } = getLogsForDate(dateStr);
            const hasActivity = workouts.length > 0 || nutrition || water || sleep;

            return (
              <button 
                key={d} 
                onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square p-2 rounded-xl border flex flex-col items-center justify-between transition-all hover:scale-105 hover:z-10 relative group ${
                  isToday ? "border-primary bg-primary/5 shadow-glow-sm" : 
                  selectedDate === dateStr ? "border-primary/50 bg-surface-2" : "border-border/30 bg-surface-1/30 hover:border-primary/30"
                }`}
              >
                <span className={`text-sm font-bold ${isToday ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>{d}</span>
                <div className="flex flex-wrap justify-center gap-1">
                  {workouts.length > 0 && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  {nutrition && <div className="h-1.5 w-1.5 rounded-full bg-accent" />}
                  {water && <div className="h-1.5 w-1.5 rounded-full bg-success" />}
                  {sleep && <Moon className="h-2.5 w-2.5 text-indigo-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {selectedDate && (
        <Card className="p-6 bg-gradient-card border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-xl uppercase">Activity for {new Date(selectedDate).toLocaleDateString(undefined, { dateStyle: 'full' })}</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}><X className="h-4 w-4 mr-1" /> Close</Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-widest">
                <Dumbbell className="h-4 w-4" /> Workouts
              </div>
              {selectedData?.workouts.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No workouts logged.</p>
              ) : (
                selectedData?.workouts.map((w: any) => (
                  <div key={w.id} className="p-3 rounded-lg bg-surface-1 border border-border/40">
                    <div className="text-sm font-bold">{w.name || "Gym Session"}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">{w.duration || 0} mins · {w.totalVolume || 0} kg total</div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-accent uppercase tracking-widest">
                <Apple className="h-4 w-4" /> Nutrition
              </div>
              {!selectedData?.nutrition ? (
                <p className="text-xs text-muted-foreground italic">No nutrition logs.</p>
              ) : (
                <div className="p-3 rounded-lg bg-surface-1 border border-border/40 space-y-2">
                  <div className="text-sm font-bold">{selectedData.nutrition.totals?.calories || 0} kcal</div>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="text-[10px] text-muted-foreground uppercase">P: {selectedData.nutrition.totals?.protein || 0}g</div>
                    <div className="text-[10px] text-muted-foreground uppercase">C: {selectedData.nutrition.totals?.carbs || 0}g</div>
                    <div className="text-[10px] text-muted-foreground uppercase">F: {selectedData.nutrition.totals?.fats || 0}g</div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-success uppercase tracking-widest">
                <Droplets className="h-4 w-4" /> Hydration
              </div>
              {!selectedData?.water ? (
                <p className="text-xs text-muted-foreground italic">No hydration logs.</p>
              ) : (
                <div className="p-3 rounded-lg bg-surface-1 border border-border/40">
                  <div className="text-sm font-bold">{(selectedData.water.total_ml / 1000).toFixed(1)} Liters</div>
                </div>
              )}

              {selectedData?.sleep && (
                <div className="p-3 rounded-lg bg-indigo-900/10 border border-indigo-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Moon className="h-3 w-3 text-indigo-400" />
                    <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Sleep Info</span>
                  </div>
                  <div className="text-sm font-bold text-indigo-100">{selectedData.sleep.duration} Hours</div>
                  <div className="text-[9px] text-indigo-300/50 uppercase">Stage: {selectedData.sleep.quality}</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Special Events / Cheat Meals</h4>
              <EventDialog dateStr={selectedDate} uid={profile?.id} />
            </div>
            {selectedData?.events?.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-border/60 bg-surface-1/30 text-center">
                <p className="text-xs text-muted-foreground">No custom events for this date.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {selectedData?.events?.map((ev: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-surface-1 border border-border/40 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
                      {ev.type === "cheat" ? <Utensils className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{ev.title}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{ev.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

function EventDialog({ dateStr, uid }: { dateStr: string; uid: string | undefined }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("event");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;
    setLoading(true);
    try {
      await logEvent(uid, {
        title,
        type,
        date: dateStr,
      });
      toast({ title: "Event Added", description: "Successfully added to your calendar." });
      setOpen(false);
      setTitle("");
    } catch (err) {
      toast({ title: "Error", description: "Failed to add event.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs"><Plus className="h-3 w-3 mr-1" /> Add Event</Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-card border-border/50 sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Calendar Event</DialogTitle>
          <DialogDescription>Mark a rest day, cheat meal, or goal.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Event Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Cheat Meal: Pizza" className="bg-surface-1 border-border/40" required />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              {[
                { id: "event", label: "Event", icon: Zap },
                { id: "cheat", label: "Cheat Meal", icon: Utensils },
                { id: "rest", label: "Rest Day", icon: Coffee },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${type === t.id ? "border-primary bg-primary/10 text-primary" : "border-border/40 bg-surface-1 text-muted-foreground hover:border-primary/30"}`}
                >
                  <t.icon className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add to Calendar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default Schedule;
