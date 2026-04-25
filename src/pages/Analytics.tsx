import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Trophy, Flame, Activity, Target, Calendar } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, RadialBar, RadialBarChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, PolarAngleAxis, Radar, RadarChart, PolarGrid, PolarRadiusAxis,
} from "recharts";

const weightTrend = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  weight: 82 - i * 0.08 + Math.sin(i / 3) * 0.3,
}));

const volumeData = [
  { wk: "W1", vol: 18000 }, { wk: "W2", vol: 20500 }, { wk: "W3", vol: 19200 },
  { wk: "W4", vol: 22000 }, { wk: "W5", vol: 23400 }, { wk: "W6", vol: 24800 },
];

const liftProgress = [
  { day: "M1", bench: 70, squat: 100, dead: 130 },
  { day: "M2", bench: 75, squat: 105, dead: 135 },
  { day: "M3", bench: 80, squat: 112, dead: 142 },
  { day: "M4", bench: 82, squat: 115, dead: 148 },
  { day: "M5", bench: 87, squat: 118, dead: 152 },
  { day: "M6", bench: 90, squat: 120, dead: 155 },
];

const muscleBalance = [
  { muscle: "Chest", value: 85 },
  { muscle: "Back", value: 78 },
  { muscle: "Shoulders", value: 72 },
  { muscle: "Arms", value: 90 },
  { muscle: "Legs", value: 60 },
  { muscle: "Core", value: 55 },
];

const goalProgress = [{ name: "Goal", value: 78, fill: "hsl(var(--primary))" }];

const prHistory = [
  { lift: "Bench Press", new: 90, prev: 87, date: "2 days ago" },
  { lift: "Deadlift", new: 155, prev: 150, date: "5 days ago" },
  { lift: "Squat", new: 120, prev: 117, date: "1 week ago" },
  { lift: "Overhead Press", new: 60, prev: 57.5, date: "2 weeks ago" },
];

const Analytics = () => {
  return (
    <DashboardLayout
      title="Analytics"
      subtitle="6-week training cycle · trending up across all metrics"
      action={
        <Button variant="outline" size="sm"><Calendar className="h-4 w-4" /> Last 30 days</Button>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: "Total volume", value: "24.8k", unit: "kg", trend: "+12%", up: true },
          { icon: TrendingDown, label: "Body weight", value: "79.4", unit: "kg", trend: "-2.3 kg", up: false, good: true },
          { icon: Trophy, label: "PRs this month", value: "7", unit: "lifts", trend: "+3", up: true },
          { icon: Flame, label: "Avg intensity", value: "82", unit: "%", trend: "+4%", up: true },
        ].map((s) => (
          <Card key={s.label} className="p-5 bg-gradient-card border-border/50 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <Badge className={`text-xs border-0 ${s.up || s.good ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                {s.trend}
              </Badge>
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

      {/* Strength curve */}
      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h3 className="font-display font-semibold text-lg">Big 3 Progression</h3>
            <p className="text-xs text-muted-foreground">6-month timeline · 1RM estimate</p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Bench (+20kg)</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /> Squat (+20kg)</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" /> Deadlift (+25kg)</span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={liftProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="bench" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="squat" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="dead" stroke="hsl(var(--success))" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Weight + Volume + Goal */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-gradient-card border-border/50">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold text-lg">Body weight trend</h3>
              <p className="text-xs text-muted-foreground">30-day cut · target 78 kg</p>
            </div>
            <Badge className="bg-success/15 text-success border-0">-2.3 kg</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightTrend}>
                <defs>
                  <linearGradient id="wG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={["dataMin - 0.5", "dataMax + 0.5"]} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="weight" stroke="hsl(var(--accent))" strokeWidth={2.5} fill="url(#wG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border-border/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial-glow opacity-50" />
          <div className="relative">
            <h3 className="font-display font-semibold text-lg">Monthly Goal</h3>
            <p className="text-xs text-muted-foreground mb-3">22 of 28 sessions</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="100%" barSize={14} data={goalProgress} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: "hsl(var(--surface-1))" }} dataKey="value" cornerRadius={10} fill="url(#goalGrad)" />
                  <defs>
                    <linearGradient id="goalGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                  </defs>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center -mt-32 mb-12 relative pointer-events-none">
              <div className="font-display text-4xl font-bold gradient-text">78%</div>
              <div className="text-xs text-muted-foreground">on track</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Volume + Balance */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-card border-border/50">
          <h3 className="font-display font-semibold text-lg mb-1">Weekly volume</h3>
          <p className="text-xs text-muted-foreground mb-5">Total tonnage lifted (kg)</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <defs>
                  <linearGradient id="volG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--primary-deep))" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                <XAxis dataKey="wk" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} cursor={{ fill: "hsl(var(--primary) / 0.08)" }} />
                <Bar dataKey="vol" fill="url(#volG)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border-border/50">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display font-semibold text-lg">Muscle balance</h3>
            <Badge variant="outline" className="text-warning border-warning/40 bg-warning/10">Legs lagging</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Volume distribution this month</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={muscleBalance}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="muscle" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Volume" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} strokeWidth={2} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* PR Timeline */}
      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> Recent Personal Records
            </h3>
            <p className="text-xs text-muted-foreground">7 PRs in the last 30 days</p>
          </div>
        </div>
        <div className="space-y-2">
          {prHistory.map((pr, i) => (
            <div key={pr.lift} className="flex items-center gap-4 p-3 rounded-lg bg-surface-1 border border-border/40 hover:border-primary/40 hover:shadow-glow-sm transition-all" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow-sm">
                <Trophy className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{pr.lift}</div>
                <div className="text-xs text-muted-foreground">{pr.date}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground line-through">{pr.prev} kg</span>
                <span className="font-display text-lg font-bold gradient-text">{pr.new} kg</span>
                <Badge className="bg-success/15 text-success border-0">+{(pr.new - pr.prev).toFixed(1)}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default Analytics;
