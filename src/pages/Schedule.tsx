import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Dumbbell, Apple, Moon, Coffee, Clock, Flame } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";

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
  meal: "bg-accent/20 text-accent border-accent/40",
  sleep: "bg-surface-3 text-muted-foreground border-border",
  rest: "bg-success/20 text-success border-success/40",
};

const typeIcon: Record<string, any> = {
  workout: Dumbbell,
  meal: Apple,
  sleep: Moon,
  rest: Coffee,
};

const Schedule = () => {
  const { profile, recentWorkouts } = useUserData();
  const [view, setView] = useState<"week" | "day">("week");
  const hours = Array.from({ length: 19 }, (_, i) => i + 4); // 4am - 10pm

  const routine = profile?.routine?.schedule || {};
  const routineTime = profile?.routine?.time || "18:00";
  const startHour = parseInt(routineTime.split(":")[0]) || 18;
  const duration = (profile?.routine?.duration || 60) / 60;

  // Derive events from routine
  const events: Event[] = [];
  DAYS_FULL.forEach((day) => {
    const sessions = routine[day] || [];
    sessions.forEach((s: string, sessionIdx: number) => {
      // Stagger sessions if multiple exist
      const sessionStart = startHour + (sessionIdx * (duration + 0.5)); 
      
      events.push({
        day: day,
        start: sessionStart,
        duration: duration,
        title: s,
        type: s === "Rest" ? "rest" : "workout",
        detail: s === "Rest" ? "Recovery" : "Scheduled Session"
      });
    });
  });

  const stats = {
    workouts: events.filter((e) => e.type === "workout").length,
    duration: events.filter((e) => e.type === "workout").reduce((s, e) => s + e.duration, 0),
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
    </DashboardLayout>
  );
};

export default Schedule;
