import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus, Dumbbell, Apple, Moon, Coffee, Clock, Flame } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dates = [11, 12, 13, 14, 15, 16, 17];
const today = 13;

interface Event {
  day: number;
  start: number; // hour 0-24
  duration: number; // hours
  title: string;
  type: "workout" | "meal" | "sleep" | "rest";
  detail: string;
}

const events: Event[] = [
  { day: 11, start: 7, duration: 1, title: "Upper", type: "workout", detail: "Push · 5 ex" },
  { day: 11, start: 13, duration: 0.5, title: "Lunch", type: "meal", detail: "750 kcal" },
  { day: 12, start: 8, duration: 0.5, title: "Cardio", type: "workout", detail: "30 min Z2" },
  { day: 12, start: 19, duration: 1, title: "Pull", type: "workout", detail: "Back · 6 ex" },
  { day: 13, start: 7.5, duration: 0.5, title: "Breakfast", type: "meal", detail: "520 kcal" },
  { day: 13, start: 18, duration: 1.25, title: "Push Day", type: "workout", detail: "Chest · Sho · Tri" },
  { day: 13, start: 22, duration: 1, title: "Wind down", type: "sleep", detail: "Target 7.5h" },
  { day: 14, start: 17, duration: 1, title: "Legs", type: "workout", detail: "Squat focus" },
  { day: 15, start: 12, duration: 0.5, title: "Meal prep", type: "meal", detail: "5 days" },
  { day: 16, start: 9, duration: 1.5, title: "Long run", type: "workout", detail: "10 km" },
  { day: 17, start: 10, duration: 1, title: "Rest day", type: "rest", detail: "Mobility" },
];

const typeStyle: Record<Event["type"], string> = {
  workout: "bg-gradient-primary text-primary-foreground border-primary/40 shadow-glow-sm",
  meal: "bg-accent/20 text-accent border-accent/40",
  sleep: "bg-surface-3 text-muted-foreground border-border",
  rest: "bg-success/20 text-success border-success/40",
};

const typeIcon: Record<Event["type"], typeof Dumbbell> = {
  workout: Dumbbell,
  meal: Apple,
  sleep: Moon,
  rest: Coffee,
};

const Schedule = () => {
  const [view, setView] = useState<"week" | "day">("week");
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6am - 9pm

  const stats = {
    workouts: events.filter((e) => e.type === "workout").length,
    meals: events.filter((e) => e.type === "meal").length,
    duration: events.filter((e) => e.type === "workout").reduce((s, e) => s + e.duration, 0),
  };

  return (
    <DashboardLayout
      title="Schedule"
      subtitle="Week of Mar 11 — 17 · 6 sessions planned"
      action={<Button variant="hero" size="sm"><Plus className="h-4 w-4" /> New event</Button>}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Dumbbell, label: "Workouts", val: `${stats.workouts}`, sub: "this week", tone: "primary" },
          { icon: Clock, label: "Total time", val: `${stats.duration}h`, sub: "training", tone: "accent" },
          { icon: Apple, label: "Meals planned", val: `${stats.meals}`, sub: "logged", tone: "warning" },
          { icon: Flame, label: "Est. burn", val: "3,840", sub: "kcal", tone: "primary" },
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

      {/* Calendar */}
      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
            <div>
              <h3 className="font-display font-semibold text-lg">March 11 — 17, 2026</h3>
              <p className="text-xs text-muted-foreground">Week 11</p>
            </div>
            <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center gap-1 bg-surface-1 p-1 rounded-lg border border-border/40">
            {(["week", "day"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  view === v ? "bg-gradient-primary text-primary-foreground shadow-glow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Week grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Day header */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-2 mb-3">
              <div />
              {days.map((d, i) => (
                <div key={d} className={`text-center p-2 rounded-lg ${dates[i] === today ? "bg-primary/10 border border-primary/30" : ""}`}>
                  <div className={`text-[10px] uppercase tracking-widest ${dates[i] === today ? "text-primary font-bold" : "text-muted-foreground"}`}>{d}</div>
                  <div className={`font-display text-xl font-bold mt-0.5 ${dates[i] === today ? "gradient-text" : ""}`}>{dates[i]}</div>
                </div>
              ))}
            </div>

            {/* Hour grid */}
            <div className="relative grid grid-cols-[60px_repeat(7,1fr)] gap-2">
              {hours.map((h) => (
                <>
                  <div key={`h-${h}`} className="text-[10px] text-muted-foreground text-right pr-2 -mt-1.5">
                    {h <= 12 ? `${h} AM` : `${h - 12} PM`}
                  </div>
                  {dates.map((d) => (
                    <div key={`${h}-${d}`} className="h-12 border-t border-border/30 relative" />
                  ))}
                </>
              ))}

              {/* Events overlay */}
              {events.map((e, idx) => {
                const colIndex = dates.indexOf(e.day);
                if (colIndex < 0) return null;
                const top = (e.start - 6) * 48 + 4;
                const height = e.duration * 48 - 6;
                const Icon = typeIcon[e.type];
                return (
                  <div
                    key={idx}
                    className={`absolute rounded-lg p-2 border text-xs cursor-pointer transition-all hover:scale-[1.02] hover:z-10 ${typeStyle[e.type]}`}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      left: `calc(60px + ${(colIndex / 7) * 100}% + ${colIndex * 8 / 7}px)`,
                      width: `calc(${100 / 7}% - 8px)`,
                    }}
                  >
                    <div className="flex items-center gap-1.5 font-bold truncate">
                      <Icon className="h-3 w-3 shrink-0" />
                      <span className="truncate">{e.title}</span>
                    </div>
                    {height > 30 && <div className="text-[10px] opacity-80 mt-0.5 truncate">{e.detail}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-border/50 text-xs">
          {(Object.keys(typeIcon) as Event["type"][]).map((t) => {
            const Icon = typeIcon[t];
            return (
              <div key={t} className="flex items-center gap-1.5">
                <div className={`h-5 w-5 rounded flex items-center justify-center ${typeStyle[t]}`}>
                  <Icon className="h-3 w-3" />
                </div>
                <span className="text-muted-foreground capitalize">{t}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Today's agenda */}
      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Today's agenda
          </h3>
          <Badge className="bg-primary/15 text-primary border-primary/30">Wednesday Mar 13</Badge>
        </div>
        <div className="space-y-2">
          {events.filter((e) => e.day === today).map((e) => {
            const Icon = typeIcon[e.type];
            return (
              <div key={e.title} className="flex items-center gap-4 p-3 rounded-lg bg-surface-1 border border-border/40 hover:border-primary/30 transition-colors">
                <div className="text-right">
                  <div className="font-display font-bold text-sm">{Math.floor(e.start)}:{e.start % 1 === 0.5 ? "30" : "00"}</div>
                  <div className="text-[10px] text-muted-foreground">{e.duration}h</div>
                </div>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${typeStyle[e.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{e.detail}</div>
                </div>
                <Button variant="ghost" size="sm">Details</Button>
              </div>
            );
          })}
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default Schedule;
