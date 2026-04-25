import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Droplets, Plus, Minus, Coffee, GlassWater, Milk, Flame, Bell } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const weekData = [
  { day: "Mon", ml: 2800 }, { day: "Tue", ml: 3100 }, { day: "Wed", ml: 2400 },
  { day: "Thu", ml: 2900 }, { day: "Fri", ml: 3000 }, { day: "Sat", ml: 2200 }, { day: "Sun", ml: 2100 },
];

const Hydration = () => {
  const [intake, setIntake] = useState(2100); // ml
  const goal = 3000;
  const pct = Math.min((intake / goal) * 100, 100);

  const add = (ml: number) => setIntake((v) => Math.min(v + ml, goal * 1.5));

  // Bottle: animate fill from bottom up
  const fillHeight = pct;

  return (
    <DashboardLayout
      title="Hydration"
      subtitle={`${(intake / 1000).toFixed(2)} L of ${(goal / 1000).toFixed(1)} L · ${Math.round(pct)}% complete`}
      action={<Button variant="hero" size="sm"><Plus className="h-4 w-4" /> Add water</Button>}
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Animated bottle */}
        <Card className="lg:col-span-1 p-6 bg-gradient-card border-border/50 relative overflow-hidden flex flex-col items-center">
          <div className="absolute inset-0 bg-gradient-radial-glow opacity-30" />
          <div className="relative">
            <div className="text-xs text-primary uppercase tracking-widest font-semibold text-center mb-1">Today's Hydration</div>
            <div className="font-display text-5xl font-bold text-center gradient-text mb-6 tabular-nums">{(intake / 1000).toFixed(2)}<span className="text-2xl text-muted-foreground">L</span></div>

            {/* Bottle SVG */}
            <div className="relative w-48 h-72 mx-auto">
              <svg viewBox="0 0 200 300" className="w-full h-full">
                <defs>
                  <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0 84% 65%)" />
                    <stop offset="100%" stopColor="hsl(0 84% 45%)" />
                  </linearGradient>
                  <clipPath id="bottleClip">
                    <path d="M70 40 L70 70 Q70 80 60 90 L50 110 Q40 130 40 160 L40 270 Q40 285 55 285 L145 285 Q160 285 160 270 L160 160 Q160 130 150 110 L140 90 Q130 80 130 70 L130 40 Z" />
                  </clipPath>
                </defs>

                {/* Cap */}
                <rect x="78" y="20" width="44" height="22" rx="4" fill="hsl(var(--primary))" />
                <rect x="74" y="38" width="52" height="8" rx="2" fill="hsl(var(--primary-deep))" />

                {/* Bottle outline */}
                <path
                  d="M70 40 L70 70 Q70 80 60 90 L50 110 Q40 130 40 160 L40 270 Q40 285 55 285 L145 285 Q160 285 160 270 L160 160 Q160 130 150 110 L140 90 Q130 80 130 70 L130 40 Z"
                  fill="hsl(var(--surface-1))"
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                />

                {/* Water fill (clipped) */}
                <g clipPath="url(#bottleClip)">
                  <rect
                    x="0"
                    y={300 - (260 * fillHeight) / 100}
                    width="200"
                    height="300"
                    fill="url(#waterGrad)"
                    style={{ transition: "y 1s cubic-bezier(0.22, 1, 0.36, 1)" }}
                  />
                  {/* Wave animation */}
                  <path
                    d={`M 0 ${300 - (260 * fillHeight) / 100} Q 50 ${295 - (260 * fillHeight) / 100} 100 ${300 - (260 * fillHeight) / 100} T 200 ${300 - (260 * fillHeight) / 100} L 200 300 L 0 300 Z`}
                    fill="hsl(0 90% 70% / 0.4)"
                    style={{ transition: "d 1s cubic-bezier(0.22, 1, 0.36, 1)" }}
                  >
                    <animate attributeName="d" dur="3s" repeatCount="indefinite"
                      values={`
                        M 0 ${300 - (260 * fillHeight) / 100} Q 50 ${295 - (260 * fillHeight) / 100} 100 ${300 - (260 * fillHeight) / 100} T 200 ${300 - (260 * fillHeight) / 100} L 200 300 L 0 300 Z;
                        M 0 ${300 - (260 * fillHeight) / 100} Q 50 ${305 - (260 * fillHeight) / 100} 100 ${300 - (260 * fillHeight) / 100} T 200 ${300 - (260 * fillHeight) / 100} L 200 300 L 0 300 Z;
                        M 0 ${300 - (260 * fillHeight) / 100} Q 50 ${295 - (260 * fillHeight) / 100} 100 ${300 - (260 * fillHeight) / 100} T 200 ${300 - (260 * fillHeight) / 100} L 200 300 L 0 300 Z
                      `} />
                  </path>
                </g>

                {/* Highlight */}
                <path d="M55 110 Q50 130 50 160 L50 250" stroke="hsl(0 0% 100% / 0.1)" strokeWidth="3" fill="none" strokeLinecap="round" />

                {/* Percentage in center */}
                <text x="100" y="180" textAnchor="middle" fill="white" fontSize="24" fontWeight="700" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
                  {Math.round(pct)}%
                </text>
              </svg>

              {/* Floating bubbles */}
              {fillHeight > 20 && (
                <>
                  <div className="absolute bottom-8 left-1/3 h-2 w-2 rounded-full bg-white/40 animate-float" />
                  <div className="absolute bottom-16 right-1/3 h-1.5 w-1.5 rounded-full bg-white/30 animate-float" style={{ animationDelay: "1s" }} />
                  <div className="absolute bottom-24 left-1/2 h-1 w-1 rounded-full bg-white/40 animate-float" style={{ animationDelay: "2s" }} />
                </>
              )}
            </div>

            <div className="flex justify-center gap-2 mt-6">
              <Button size="icon" variant="outline" onClick={() => setIntake((v) => Math.max(v - 250, 0))}><Minus className="h-4 w-4" /></Button>
              <Button variant="hero" onClick={() => add(250)} className="px-6"><Plus className="h-4 w-4" /> 250 ml</Button>
              <Button size="icon" variant="outline" onClick={() => add(500)}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick add */}
          <Card className="p-6 bg-gradient-card border-border/50">
            <h3 className="font-display font-semibold text-lg mb-4">Quick add</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: GlassWater, label: "Glass", ml: 250 },
                { icon: Coffee, label: "Cup", ml: 200 },
                { icon: Milk, label: "Bottle", ml: 500 },
                { icon: Droplets, label: "Large", ml: 750 },
              ].map((q) => (
                <button
                  key={q.label}
                  onClick={() => add(q.ml)}
                  className="group p-4 rounded-xl bg-surface-1 border border-border/40 hover:border-primary/40 hover:shadow-glow-sm transition-all text-center"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mx-auto mb-2 transition-colors">
                    <q.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="font-semibold text-sm">{q.label}</div>
                  <div className="text-xs text-muted-foreground">{q.ml} ml</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Stats row */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Flame, label: "Streak", value: "12", unit: "days", tone: "primary" },
              { icon: Droplets, label: "7-day avg", value: "2.6", unit: "L", tone: "accent" },
              { icon: Bell, label: "Next reminder", value: "in 47", unit: "min", tone: "success" },
            ].map((s) => (
              <Card key={s.label} className="p-4 bg-gradient-card border-border/50">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.tone === "primary" ? "bg-primary/15 text-primary" : s.tone === "accent" ? "bg-accent/15 text-accent" : "bg-success/15 text-success"}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className="font-display text-lg font-bold">{s.value}<span className="text-xs text-muted-foreground ml-1 font-medium">{s.unit}</span></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Weekly chart */}
          <Card className="p-6 bg-gradient-card border-border/50">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-semibold text-lg">This week</h3>
                <p className="text-xs text-muted-foreground">Daily water intake (ml)</p>
              </div>
              <Badge variant="outline" className="border-success/40 text-success bg-success/10">+8% vs last week</Badge>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekData}>
                  <defs>
                    <linearGradient id="waterBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--primary-deep))" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} cursor={{ fill: "hsl(var(--primary) / 0.08)" }} />
                  <Bar dataKey="ml" fill="url(#waterBar)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Hydration;
