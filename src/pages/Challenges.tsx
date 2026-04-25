import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Droplets, Dumbbell, Star, Zap, Shield, Target, Crown, Medal, Sparkles } from "lucide-react";

const badges = [
  { icon: Flame, name: "Inferno", desc: "30-day streak", earned: true, rare: "Legendary", color: "primary" },
  { icon: Droplets, name: "Hydro", desc: "100L logged", earned: true, rare: "Epic", color: "accent" },
  { icon: Dumbbell, name: "Iron Forged", desc: "100 workouts", earned: true, rare: "Epic", color: "primary" },
  { icon: Trophy, name: "PR Hunter", desc: "10 personal records", earned: true, rare: "Rare", color: "warning" },
  { icon: Crown, name: "King of Push", desc: "50 push sessions", earned: false, rare: "Legendary", color: "primary" },
  { icon: Star, name: "All-Rounder", desc: "Hit every muscle group", earned: true, rare: "Rare", color: "accent" },
  { icon: Shield, name: "Iron Will", desc: "0 missed days in a month", earned: false, rare: "Epic", color: "success" },
  { icon: Zap, name: "Speed Demon", desc: "Sub-45min workout 10x", earned: true, rare: "Common", color: "warning" },
  { icon: Medal, name: "Centurion", desc: "100 sets in a week", earned: false, rare: "Rare", color: "primary" },
];

const challenges = [
  { name: "30-Day Iron Streak", desc: "Train 30 days in a row", progress: 23, total: 30, reward: "+1500 XP", icon: Flame, color: "primary" },
  { name: "Hydration Hero", desc: "Hit 3L daily for 7 days", progress: 5, total: 7, reward: "Hydro badge", icon: Droplets, color: "accent" },
  { name: "Volume King", desc: "Lift 25,000 kg this week", progress: 18400, total: 25000, reward: "+800 XP", icon: Dumbbell, color: "primary" },
  { name: "Leg Day Redemption", desc: "Complete 4 leg days this month", progress: 2, total: 4, reward: "Crown badge", icon: Crown, color: "warning" },
];

const leaderboard = [
  { rank: 1, name: "Marcus T.", level: 42, xp: 18420, you: false },
  { rank: 2, name: "Sasha K.", level: 38, xp: 16100, you: false },
  { rank: 3, name: "Alex Carter", level: 24, xp: 14820, you: true },
  { rank: 4, name: "Diego R.", level: 23, xp: 13900, you: false },
  { rank: 5, name: "Priya M.", level: 22, xp: 13200, you: false },
];

const rareColors: Record<string, string> = {
  Common: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30",
  Rare: "bg-accent/15 text-accent border-accent/30",
  Epic: "bg-primary/15 text-primary border-primary/30",
  Legendary: "bg-gradient-ember text-primary-foreground border-0",
};

const Challenges = () => {
  return (
    <DashboardLayout
      title="Challenges"
      subtitle="Level 24 · 4,820 XP · 1,180 to next level"
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
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 backdrop-blur mb-3">PRO TIER</Badge>
            <div className="flex items-baseline gap-2">
              <div className="font-display text-6xl font-bold text-primary-foreground">Lvl 24</div>
              <div className="text-primary-foreground/80">/ 50</div>
            </div>
            <div className="font-display text-xl font-semibold text-primary-foreground/90 mt-1">Iron Forged</div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-primary-foreground/80 mb-2">
              <span>4,820 XP</span>
              <span>6,000 XP</span>
            </div>
            <div className="h-3 bg-primary-foreground/15 rounded-full overflow-hidden backdrop-blur">
              <div className="h-full bg-primary-foreground rounded-full" style={{ width: "80%" }} />
            </div>
            <p className="text-xs text-primary-foreground/80 mt-2">1,180 XP to <span className="font-semibold">Lvl 25 — Ironclad</span></p>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: "Streak", val: "42d" },
                { label: "Badges", val: "6/9" },
                { label: "Rank", val: "#3" },
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
          <Badge className="bg-primary/15 text-primary border-primary/30">4 active</Badge>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {challenges.map((c, i) => {
            const pct = Math.min((c.progress / c.total) * 100, 100);
            return (
              <Card key={c.name} className="p-5 bg-gradient-card border-border/50 hover:border-primary/30 transition-all hover:-translate-y-0.5" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center animate-pulse-glow ${c.color === "primary" ? "bg-primary/15 text-primary" : c.color === "accent" ? "bg-accent/15 text-accent" : "bg-warning/15 text-warning"}`}>
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
                        <span>{c.progress.toLocaleString()} / {c.total.toLocaleString()}</span>
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
          <span className="text-xs text-muted-foreground">6 of 9 earned</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {badges.map((b, i) => (
            <Card
              key={b.name}
              className={`group p-5 text-center transition-all hover:-translate-y-1 ${
                b.earned
                  ? "bg-gradient-card border-border/50 hover:border-primary/40 hover:shadow-glow-sm"
                  : "bg-surface-1/50 border-border/30 opacity-60 grayscale hover:opacity-80"
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`mx-auto mb-3 h-16 w-16 rounded-2xl flex items-center justify-center relative ${
                b.earned ? (b.color === "primary" ? "bg-primary/15 text-primary" : b.color === "accent" ? "bg-accent/15 text-accent" : b.color === "warning" ? "bg-warning/15 text-warning" : "bg-success/15 text-success") : "bg-surface-2 text-muted-foreground"
              } ${b.earned ? "animate-pulse-glow" : ""}`}>
                <b.icon className="h-7 w-7" />
                {b.earned && <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/20" />}
              </div>
              <div className="font-display font-bold text-sm">{b.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{b.desc}</div>
              <Badge className={`mt-3 text-[10px] ${rareColors[b.rare]}`}>{b.rare}</Badge>
            </Card>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-warning" /> Friends Leaderboard
            </h3>
            <p className="text-xs text-muted-foreground">This week's XP</p>
          </div>
          <Button variant="outline" size="sm">Invite friends</Button>
        </div>
        <div className="space-y-2">
          {leaderboard.map((p) => (
            <div
              key={p.rank}
              className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                p.you ? "bg-primary/10 border-primary/40 shadow-glow-sm" : "bg-surface-1 border-border/40 hover:border-border"
              }`}
            >
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-display font-bold ${
                p.rank === 1 ? "bg-gradient-ember text-primary-foreground" :
                p.rank === 2 ? "bg-muted-foreground/30 text-foreground" :
                p.rank === 3 ? "bg-warning/30 text-warning" :
                "bg-surface-2 text-muted-foreground"
              }`}>
                {p.rank}
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                {p.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm flex items-center gap-2">
                  {p.name}
                  {p.you && <Badge className="bg-primary/20 text-primary border-0 text-[10px]">You</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">Level {p.level}</div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold gradient-text">{p.xp.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">XP</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default Challenges;
