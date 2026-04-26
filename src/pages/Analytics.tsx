import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Trophy, Flame, Activity, Target, Calendar, Dumbbell } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, RadialBar, RadialBarChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useUserData } from "@/hooks/useUserData";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Analytics = () => {
  const { recentWorkouts, profile, loading } = useUserData();

  if (loading) {
    return <DashboardLayout title="Analytics" subtitle="Loading your data..."><div className="flex items-center justify-center h-64">Loading...</div></DashboardLayout>;
  }

  // Calculate volume progression
  const volumeData = (() => {
    if (!recentWorkouts || recentWorkouts.length === 0) {
      return [
        { wk: "W1", vol: 0 }, { wk: "W2", vol: 0 }, { wk: "W3", vol: 0 },
        { wk: "W4", vol: 0 }, { wk: "W5", vol: 0 }, { wk: "W6", vol: 0 },
      ];
    }
    // Group by sessions
    return recentWorkouts.slice(0, 6).reverse().map((w, i) => ({
      wk: `S${i + 1}`,
      vol: w.totalVolume ?? 0
    }));
  })();

  const totalVolume = recentWorkouts.reduce((acc, w) => acc + (w.totalVolume ?? 0), 0);
  const avgVolume = recentWorkouts.length > 0 ? totalVolume / recentWorkouts.length : 0;
  
  const xp = profile?.gamification?.xp ?? 0;
  const level = profile?.gamification?.level ?? 1;

  // Derive real PRs from workouts
  const personalRecords = (() => {
    const records: Record<string, { weight: number, date: string }> = {};
    recentWorkouts.forEach(w => {
      w.exercises?.forEach(ex => {
        ex.sets?.forEach((s: any) => {
          if (s.done && (!records[ex.name] || Number(s.weight) > records[ex.name].weight)) {
            records[ex.name] = { weight: Number(s.weight), date: w.date || "N/A" };
          }
        });
      });
    });
    
    const prs = Object.entries(records)
      .map(([name, data]) => ({
        exercise: name,
        weight: data.weight,
        date: data.date,
        trend: "up" as const
      }))
      .sort((a, b) => b.weight - a.weight);

    return prs.length > 0 ? prs.slice(0, 3) : [
      { exercise: "No PRs logged yet", weight: 0, date: "-", trend: "stable" as const }
    ];
  })();

  return (
    <DashboardLayout
      title="Analytics"
      subtitle={`${recentWorkouts.length} total sessions tracked · Level ${level}`}
      action={
        <Button variant="outline" size="sm"><Calendar className="h-4 w-4" /> Last 30 days</Button>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: "Total volume", value: (totalVolume / 1000).toFixed(1), unit: "k kg", trend: "+12%", up: true },
          { icon: Activity, label: "Avg Volume", value: (avgVolume / 1000).toFixed(1), unit: "k kg", trend: "Steady", up: true },
          { icon: Trophy, label: "XP Earned", value: xp.toLocaleString(), unit: "XP", trend: `Lv.${level}`, up: true },
          { icon: Flame, label: "Sessions", value: recentWorkouts.length.toString(), unit: "total", trend: "+2", up: true },
        ].map((s) => (
          <Card key={s.label} className="p-5 bg-gradient-card border-border/50 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <Badge className="text-xs border-0 bg-success/15 text-success">
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

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        {/* Strength curve */}
        <Card className="lg:col-span-2 p-6 bg-gradient-card border-border/50">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h3 className="font-display font-semibold text-lg">Volume Progression</h3>
              <p className="text-xs text-muted-foreground">Last {recentWorkouts.length} sessions · Total Tonnage</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="volG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="wk" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="vol" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#volG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* PRs */}
        <Card className="p-6 bg-gradient-card border-border/50">
          <h3 className="font-display font-semibold text-lg mb-6">Personal Records</h3>
          <div className="space-y-6">
            {personalRecords.map((pr) => (
              <div key={pr.exercise} className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{pr.exercise}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{pr.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-primary">{pr.weight} kg</div>
                  <div className="text-[10px] text-success flex items-center gap-1 justify-end">
                    <TrendingUp className="h-3 w-3" /> {pr.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-8 p-6 bg-gradient-card border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Recent Activity
            </h3>
            <p className="text-xs text-muted-foreground">Your latest tracked sessions</p>
          </div>
        </div>
        <div className="space-y-2">
          {recentWorkouts.length > 0 ? (
            recentWorkouts.slice(0, 5).map((w, i) => (
              <div key={w.id || i} className="flex items-center gap-4 p-3 rounded-lg bg-surface-1 border border-border/40 hover:border-primary/40 transition-all">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{w.name || "Workout"}</div>
                  <div className="text-xs text-muted-foreground">{w.date || "Unknown date"} · {w.duration || 0} mins</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold gradient-text">{w.totalVolume?.toLocaleString() || 0} kg</div>
                  <Badge className="bg-success/15 text-success border-0 text-[10px]">+{w.xpEarned || 0} XP</Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm italic">
              No recent activity to show.
            </div>
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default Analytics;
