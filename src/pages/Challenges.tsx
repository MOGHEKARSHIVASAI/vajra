import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Droplets, Dumbbell, Star, Zap, Shield, Target, Crown, Medal, Sparkles } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";

const badges = [
  { icon: Flame, name: "Inferno", desc: "30-day streak", earned: false, rare: "Legendary", color: "primary" },
  { icon: Droplets, name: "Hydro", desc: "100L logged", earned: false, rare: "Epic", color: "accent" },
  { icon: Dumbbell, name: "Vajra Master", desc: "100 workouts", earned: false, rare: "Epic", color: "primary" },
  { icon: Trophy, name: "PR Hunter", desc: "10 personal records", earned: false, rare: "Rare", color: "warning" },
  { icon: Crown, name: "King of Push", desc: "50 push sessions", earned: false, rare: "Legendary", color: "primary" },
  { icon: Star, name: "All-Rounder", desc: "Hit every muscle group", earned: false, rare: "Rare", color: "accent" },
];

const challenges = [
  { name: "30-Day Vajra Streak", desc: "Train 30 days in a row", total: 30, reward: "+1500 XP", icon: Flame, color: "primary" },
  { name: "Hydration Hero", desc: "Hit 3L daily for 7 days", total: 7, reward: "Hydro badge", icon: Droplets, color: "accent" },
  { name: "Volume King", desc: "Lift 25,000 kg this week", total: 25000, reward: "+800 XP", icon: Dumbbell, color: "primary" },
];

const rareColors: Record<string, string> = {
  Common: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30",
  Rare: "bg-accent/15 text-accent border-accent/30",
  Epic: "bg-primary/15 text-primary border-primary/30",
  Legendary: "bg-gradient-ember text-primary-foreground border-0",
};

const Challenges = () => {
  const { profile, recentWorkouts, weekWater } = useUserData();
  
  const xp = profile?.gamification?.xp ?? 0;
  const level = profile?.gamification?.level ?? 1;
  const streak = profile?.gamification?.streak ?? 0;
  
  const xpInLevel = xp % 1000;
  const xpPct = (xpInLevel / 1000) * 100;
  
  const workoutCount = recentWorkouts.length;
  const waterCount = weekWater.length;

  return (
    <DashboardLayout
      title="Challenges"
      subtitle={`Level ${level} · ${xp.toLocaleString()} XP · ${1000 - xpInLevel} to next level`}
      action={<Button variant="hero" size="sm"><Trophy className="h-4 w-4" /> Hall of Fame</Button>}
    >
      {/* Hero level card */}
      <Card className="relative overflow-hidden bg-gradient-ember border-0 p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,transparent,rgba(0,0,0,0.5))]" />
        <div className="absolute top-4 right-4 opacity-20">
          <Crown className="h-32 w-32 text-primary-foreground" />
        </div>
        <div className="relative grid md:grid-cols-2 gap-6 items-center">
          <div>
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 backdrop-blur mb-3">ELITE ATHLETE</Badge>
            <div className="flex items-baseline gap-2">
              <div className="font-display text-6xl font-bold text-primary-foreground">Lvl {level}</div>
            </div>
            <div className="font-display text-xl font-semibold text-primary-foreground/90 mt-1">
              {level >= 20 ? "Vajra Immortal" : level >= 10 ? "Vajra Master" : "Novice"}
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-primary-foreground/80 mb-2">
              <span>{xpInLevel} XP</span>
              <span>1000 XP</span>
            </div>
            <div className="h-3 bg-primary-foreground/15 rounded-full overflow-hidden backdrop-blur">
              <div className="h-full bg-primary-foreground rounded-full" style={{ width: `${xpPct}%` }} />
            </div>
            <p className="text-xs text-primary-foreground/80 mt-2">{1000 - xpInLevel} XP to <span className="font-semibold">Lvl {level + 1}</span></p>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: "Streak", val: `${streak}d` },
                { label: "Workouts", val: workoutCount },
                { label: "XP", val: xp > 1000 ? `${(xp/1000).toFixed(1)}k` : xp },
              ].map((s) => (
                <div key={s.label} className="text-center p-2 rounded-lg bg-primary-foreground/10 backdrop-blur">
                  <div className="font-display text-xl font-bold text-primary-foreground">{s.val}</div>
                  <div className="text-[10px] text-primary-foreground/70 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Active challenges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> Active Challenges
          </h3>
          <Badge className="bg-primary/15 text-primary border-primary/30">{challenges.length} active</Badge>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {challenges.map((c, i) => {
            let progress = 0;
            if (c.name === "30-Day Vajra Streak") progress = streak;
            if (c.name === "Hydration Hero") progress = waterCount;
            if (c.name === "Volume King") progress = recentWorkouts.reduce((acc, w) => acc + (w.totalVolume ?? 0), 0) % 25000;
            
            const pct = Math.min((progress / c.total) * 100, 100);
            return (
              <Card key={c.name} className="p-5 bg-gradient-card border-border/50 hover:border-primary/30 transition-all hover:-translate-y-0.5" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${c.color === "primary" ? "bg-primary/15 text-primary" : c.color === "accent" ? "bg-accent/15 text-accent" : "bg-warning/15 text-warning"}`}>
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-display font-semibold">{c.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{c.desc}</div>
                      </div>
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary shrink-0">{c.reward}</Badge>
                    </div>
                    <div className="mt-3">
                      <Progress value={pct} className="h-1.5" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                        <span>{progress.toLocaleString()} / {c.total.toLocaleString()}</span>
                        <span className="font-semibold text-foreground">{Math.round(pct)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Badges grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Badge Collection
          </h3>
          <span className="text-xs text-muted-foreground">0 earned</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {badges.map((b, i) => {
            let earned = false;
            if (b.name === "Inferno" && streak >= 30) earned = true;
            if (b.name === "Vajra Master" && workoutCount >= 100) earned = true;

            return (
              <Card
                key={b.name}
                className={`group p-5 text-center transition-all hover:-translate-y-1 ${
                  earned
                    ? "bg-gradient-card border-border/50 hover:border-primary/40 hover:shadow-glow-sm"
                    : "bg-surface-1/50 border-border/30 opacity-60 grayscale hover:opacity-80"
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`mx-auto mb-3 h-16 w-16 rounded-2xl flex items-center justify-center relative ${
                  earned ? (b.color === "primary" ? "bg-primary/15 text-primary" : b.color === "accent" ? "bg-accent/15 text-accent" : b.color === "warning" ? "bg-warning/15 text-warning" : "bg-success/15 text-success") : "bg-surface-2 text-muted-foreground"
                }`}>
                  <b.icon className="h-7 w-7" />
                  {earned && <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/20" />}
                </div>
                <div className="font-display font-bold text-sm">{b.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{b.desc}</div>
                <Badge className={`mt-3 text-[10px] ${rareColors[b.rare]}`}>{b.rare}</Badge>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Challenges;
