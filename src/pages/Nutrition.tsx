import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Apple, Plus, Sparkles, Search, Coffee, Sandwich, Pizza, Cookie, ChevronRight, Brain } from "lucide-react";

const macros = [
  { label: "Protein", current: 142, goal: 170, unit: "g", color: "hsl(var(--primary))", icon: "P" },
  { label: "Carbs", current: 245, goal: 320, unit: "g", color: "hsl(var(--accent))", icon: "C" },
  { label: "Fats", current: 68, goal: 85, unit: "g", color: "hsl(var(--warning))", icon: "F" },
];

const meals = [
  { meal: "Breakfast", icon: Coffee, time: "7:30 AM", kcal: 520, items: ["Oats with berries", "3 eggs scrambled", "Black coffee"] },
  { meal: "Lunch", icon: Sandwich, time: "1:00 PM", kcal: 780, items: ["Chicken & rice bowl", "Mixed greens", "Olive oil"] },
  { meal: "Snack", icon: Cookie, time: "4:30 PM", kcal: 280, items: ["Greek yogurt", "Almonds", "Apple"] },
  { meal: "Dinner", icon: Pizza, time: "7:30 PM", kcal: 760, items: ["Salmon fillet", "Sweet potato", "Broccoli"] },
];

const aiSuggestions = [
  { name: "Protein Power Bowl", kcal: 480, protein: 42, tag: "High protein" },
  { name: "Mediterranean Wrap", kcal: 520, protein: 28, tag: "Balanced" },
  { name: "Whey + Banana Shake", kcal: 290, protein: 35, tag: "Quick" },
];

function MacroRing({ m }: { m: typeof macros[0] }) {
  const pct = Math.min((m.current / m.goal) * 100, 100);
  const r = 50;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <Card className="p-5 bg-gradient-card border-border/50 text-center">
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} stroke="hsl(var(--border))" strokeWidth="8" fill="none" opacity={0.4} />
          <circle
            cx="60" cy="60" r={r}
            stroke={m.color}
            strokeWidth="8" fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 8px ${m.color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-display text-2xl font-bold">{m.current}</div>
          <div className="text-[10px] text-muted-foreground">/ {m.goal}{m.unit}</div>
        </div>
      </div>
      <div className="mt-3 font-semibold text-sm">{m.label}</div>
      <div className="text-xs text-muted-foreground">{Math.round(pct)}% of goal</div>
    </Card>
  );
}

const Nutrition = () => {
  const totalKcal = meals.reduce((s, m) => s + m.kcal, 0);
  const goal = 2500;
  const calPct = (totalKcal / goal) * 100;

  return (
    <DashboardLayout
      title="Nutrition"
      subtitle={`Today · ${totalKcal} / ${goal} kcal · ${goal - totalKcal} remaining`}
      action={<Button variant="hero" size="sm"><Plus className="h-4 w-4" /> Log food</Button>}
    >
      {/* Calorie hero */}
      <Card className="relative overflow-hidden bg-gradient-card border-border/50 p-6 md:p-8">
        <div className="absolute -top-20 -right-20 h-64 w-64 bg-primary/15 rounded-full blur-3xl" />
        <div className="relative grid md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="text-xs text-primary uppercase tracking-widest font-semibold mb-2">Daily Calories</div>
            <div className="flex items-baseline gap-2">
              <div className="font-display text-5xl md:text-6xl font-bold gradient-text">{totalKcal.toLocaleString()}</div>
              <div className="text-muted-foreground">/ {goal.toLocaleString()} kcal</div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">You have <span className="text-foreground font-semibold">{goal - totalKcal} kcal</span> left for today. Stay around 25–35g protein for dinner.</p>
            <div className="mt-5 h-2 bg-surface-1 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary rounded-full transition-all duration-1000" style={{ width: `${calPct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{Math.round(calPct)}% consumed</span>
              <span>{Math.round(100 - calPct)}% left</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {macros.map((m) => <MacroRing key={m.label} m={m} />)}
          </div>
        </div>
      </Card>

      {/* Meals + AI */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-display font-semibold text-lg px-1">Today's meals</h3>
          {meals.map((m) => (
            <Card key={m.meal} className="p-4 bg-gradient-card border-border/50 hover:border-primary/30 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <m.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{m.meal}</span>
                    <Badge variant="outline" className="text-[10px] border-border/50">{m.time}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">{m.items.join(" · ")}</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold gradient-text">{m.kcal}</div>
                  <div className="text-[10px] text-muted-foreground">kcal</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          ))}

          {/* Quick add */}
          <Card className="p-4 bg-gradient-card border-dashed border-border/60 hover:border-primary/50 transition-colors">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search foods or scan barcode..." className="pl-9 bg-surface-1 border-border/40 h-11" />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {["Chicken breast", "Rice", "Eggs", "Banana", "Whey protein", "Avocado"].map((q) => (
                <button key={q} className="px-3 py-1.5 rounded-lg text-xs bg-surface-1 hover:bg-primary/15 hover:text-primary transition-colors">
                  + {q}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* AI meal suggestions */}
        <Card className="p-6 bg-gradient-card border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-primary/15 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold">AI Meal Picks</h3>
              <Sparkles className="h-3 w-3 text-primary ml-auto" />
            </div>
            <p className="text-xs text-muted-foreground mb-5">For your remaining {goal - totalKcal} kcal & 28g protein.</p>
            <div className="space-y-3">
              {aiSuggestions.map((s) => (
                <div key={s.name} className="p-3 rounded-lg bg-surface-1 border border-border/40 hover:border-primary/40 transition-all hover:-translate-y-0.5 cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="font-semibold text-sm">{s.name}</div>
                    <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">{s.tag}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>🔥 {s.kcal} kcal</span>
                    <span>💪 {s.protein}g protein</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">Generate more <Sparkles className="h-3.5 w-3.5" /></Button>
          </div>
        </Card>
      </div>

      {/* Saved meals */}
      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg">Saved meals</h3>
          <Button variant="ghost" size="sm">View all <ChevronRight className="h-3.5 w-3.5" /></Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { name: "Power Breakfast", kcal: 620, p: 38 },
            { name: "Post-workout", kcal: 480, p: 42 },
            { name: "Lean Lunch", kcal: 540, p: 35 },
            { name: "Pre-bed Casein", kcal: 230, p: 30 },
          ].map((m) => (
            <button key={m.name} className="text-left p-4 rounded-xl bg-surface-1 border border-border/40 hover:border-primary/40 hover:shadow-glow-sm transition-all">
              <div className="h-9 w-9 rounded-lg bg-accent/15 flex items-center justify-center mb-3">
                <Apple className="h-4 w-4 text-accent" />
              </div>
              <div className="font-semibold text-sm">{m.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{m.kcal} kcal · {m.p}g P</div>
            </button>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default Nutrition;
