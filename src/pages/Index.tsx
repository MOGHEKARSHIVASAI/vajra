import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { MuscleModel3D } from "@/components/MuscleModel3D";
import {
  Activity, Apple, Brain, Droplets, Flame, LineChart, Trophy,
  Zap, Bell, Target, ArrowRight, Sparkles, Dumbbell, Heart, Menu, X,
} from "lucide-react";

const features = [
  { icon: Dumbbell, title: "Workout Logging", desc: "Track every set, rep, and PR with progressive overload built-in.", tint: "primary" },
  { icon: Apple, title: "Smart Nutrition", desc: "Macros, calories, and AI meal plans tailored to your goals.", tint: "accent" },
  { icon: Activity, title: "3D Muscle Heatmap", desc: "Visualize trained muscle groups in real time with a 3D model.", tint: "primary" },
  { icon: LineChart, title: "Deep Analytics", desc: "Strength curves, weight trends, and weekly performance insights.", tint: "accent" },
  { icon: Brain, title: "AI Coach", desc: "Personalized workouts, smart nudges, and weekly summaries.", tint: "primary" },
  { icon: Droplets, title: "Health Vitals", desc: "Hydration, sleep, body weight, and BMI — all in one place.", tint: "accent" },
];

const stats = [
  { value: "40K+", label: "Athletes Training" },
  { value: "2.1M", label: "Workouts Logged" },
  { value: "98%", label: "Goal Hit Rate" },
  { value: "4.9★", label: "User Rating" },
];

const Index = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* NAV */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "glass border-b border-border/50 py-3" : "py-5"}`}>
        <div className="container flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#ai" className="hover:text-foreground transition-colors">AI Coach</a>
            <a href="#gamification" className="hover:text-foreground transition-colors">Streaks</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Button asChild variant="ghost"><Link to="/login">Log in</Link></Button>
            <Button asChild variant="hero"><Link to="/signup">Start free</Link></Button>
          </div>
          <button className="md:hidden text-foreground" onClick={() => setMobileNav(!mobileNav)} aria-label="menu">
            {mobileNav ? <X /> : <Menu />}
          </button>
        </div>
        {mobileNav && (
          <div className="md:hidden glass border-t border-border/50 mt-3 px-6 py-4 flex flex-col gap-4">
            <a href="#features" onClick={() => setMobileNav(false)}>Features</a>
            <a href="#ai" onClick={() => setMobileNav(false)}>AI Coach</a>
            <a href="#gamification" onClick={() => setMobileNav(false)}>Streaks</a>
            <Button asChild variant="ghost" size="sm"><Link to="/login">Log in</Link></Button>
            <Button asChild variant="hero" size="sm"><Link to="/signup">Start free</Link></Button>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-radial-glow pointer-events-none" />
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium mb-6">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="gradient-text font-semibold">AI-powered training</span>
                <span className="text-muted-foreground">— New v2.0</span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
                Build your <span className="gradient-text glow-text">strongest</span> self.
              </h1>

              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                The all-in-one fitness OS — workouts, nutrition, recovery, and AI coaching that actually understands your body.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" variant="hero" className="group">
                  <Link to="/signup">
                    Start training free
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/dashboard">View live demo</Link>
                </Button>
              </div>

              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-2xl font-bold gradient-text">{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3D HERO */}
            <div className="relative h-[480px] lg:h-[600px] animate-scale-in">
              <div className="absolute inset-0 bg-gradient-radial-glow opacity-80" />
              <MuscleModel3D highlights={["chest", "arms", "core"]} className="absolute inset-0" />
              {/* floating stat cards */}
              <Card className="absolute top-8 left-0 glass p-3 px-4 animate-float">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-md bg-primary/20 flex items-center justify-center">
                    <Flame className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                    <div className="font-bold text-sm">42 days</div>
                  </div>
                </div>
              </Card>
              <Card className="absolute bottom-12 right-0 glass p-3 px-4 animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-md bg-accent/20 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Level</div>
                    <div className="font-bold text-sm">Pro · 24</div>
                  </div>
                </div>
              </Card>
              <Card className="absolute top-1/2 right-4 glass p-3 px-4 animate-float" style={{ animationDelay: "2s" }}>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-md bg-success/20 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Today</div>
                    <div className="font-bold text-sm">2,340 kcal</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 relative">
        <div className="container">
          <div className="max-w-2xl mb-16">
            <div className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Everything you need</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              One app. <span className="gradient-text">Every metric.</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              From your first set to your hundredth PR — track, analyze, and improve everything that matters.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <Card
                key={f.title}
                className="group relative p-6 bg-gradient-card border-border/50 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-red overflow-hidden"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-colors" />
                <div className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl mb-5 ${f.tint === "primary" ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"}`}>
                  <f.icon className="h-5 w-5" strokeWidth={2.2} />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section id="ai" className="py-24 relative">
        <div className="container">
          <Card className="relative overflow-hidden border-primary/20 bg-gradient-card p-8 md:p-14">
            <div className="absolute inset-0 bg-gradient-radial-glow opacity-60 pointer-events-none" />
            <div className="absolute top-0 right-0 h-64 w-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-xs font-semibold text-primary mb-5">
                  <Brain className="h-3.5 w-3.5" /> AI COACH
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                  Your personal trainer that <span className="gradient-text">never sleeps.</span>
                </h3>
                <p className="mt-4 text-muted-foreground">
                  Smart nudges when you skip leg day. Macro alerts when protein dips. Weekly recaps that explain what's working — and what isn't.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Personalized weekly programs",
                    "Diet & meal recommendations",
                    "Smart inactivity nudges",
                    "Performance summaries",
                  ].map((t) => (
                    <li key={t} className="flex items-center gap-3 text-sm">
                      <div className="h-5 w-5 rounded-md bg-primary/20 flex items-center justify-center">
                        <Zap className="h-3 w-3 text-primary" />
                      </div>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <Card className="glass p-4 border-l-4 border-l-primary">
                  <div className="flex items-start gap-3">
                    <Bell className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground">AI Coach · 2m ago</div>
                      <div className="text-sm mt-0.5">You're 28g short on protein today. Try a Greek yogurt + whey shake before bed.</div>
                    </div>
                  </div>
                </Card>
                <Card className="glass p-4 border-l-4 border-l-accent">
                  <div className="flex items-start gap-3">
                    <Target className="h-4 w-4 text-accent mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground">Weekly Summary</div>
                      <div className="text-sm mt-0.5">Volume up <span className="text-success font-semibold">+12%</span>. Bench PR incoming. Schedule a deload in 2 weeks.</div>
                    </div>
                  </div>
                </Card>
                <Card className="glass p-4 border-l-4 border-l-warning">
                  <div className="flex items-start gap-3">
                    <Flame className="h-4 w-4 text-warning mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground">Heads up</div>
                      <div className="text-sm mt-0.5">No leg session in 5 days. Want me to add one to tomorrow?</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Gamification */}
      <section id="gamification" className="py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <div className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Stay addicted</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              Streaks. XP. <span className="gradient-text">Glory.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">Earn badges, climb levels, and crush weekly challenges with friends.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Flame, label: "42-Day Streak", sub: "Hydration champion", color: "primary" },
              { icon: Trophy, label: "Level 24", sub: "Pro · 4,820 XP", color: "accent" },
              { icon: Target, label: "Weekly Challenge", sub: "5/7 workouts done", color: "success" },
            ].map((b) => (
              <Card key={b.label} className="bg-gradient-card border-border/50 p-6 text-center hover:shadow-glow-sm transition-all">
                <div className={`mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-4 animate-pulse-glow ${b.color === "primary" ? "bg-primary/15 text-primary" : b.color === "accent" ? "bg-accent/15 text-accent" : "bg-success/15 text-success"}`}>
                  <b.icon className="h-7 w-7" />
                </div>
                <div className="font-display font-bold text-xl">{b.label}</div>
                <div className="text-sm text-muted-foreground mt-1">{b.sub}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="py-24">
        <div className="container">
          <Card className="relative overflow-hidden bg-gradient-ember p-12 md:p-20 text-center border-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent,rgba(0,0,0,0.4))]" />
            <div className="relative">
              <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-primary-foreground">
                Stop guessing. Unleash your power.
              </h2>
              <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
                Join 40,000+ athletes training smarter every day. Free forever — no credit card.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
                  <Link to="/signup">Create free account</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/dashboard">Try the demo</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border/50 py-10 mt-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-xs text-muted-foreground">© 2026 VAJRA. Built for athletes, by athletes.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
