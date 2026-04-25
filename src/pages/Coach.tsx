import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MuscleModel3D } from "@/components/MuscleModel3D";
import { Brain, Send, Sparkles, Zap, Target, Apple, Moon, TrendingUp, Dumbbell } from "lucide-react";

interface Msg { role: "user" | "ai"; text: string; }

const initialMessages: Msg[] = [
  { role: "ai", text: "Welcome back, Alex. I reviewed your last 7 days. Volume is up 12% — your bench is primed for a PR. Want me to plan tomorrow's session?" },
  { role: "user", text: "Yes, and balance my legs — I've been skipping them." },
  { role: "ai", text: "Smart call. Tomorrow: heavy squat day (5×5 @ 110kg), Romanian deadlifts, walking lunges, leg press. ~55 min. I'll add a deload on Friday so you don't burn out. Sound good?" },
];

const quickPrompts = [
  { icon: Dumbbell, text: "Plan my next workout" },
  { icon: Apple, text: "Suggest a high-protein dinner" },
  { icon: TrendingUp, text: "Analyze my last week" },
  { icon: Moon, text: "How can I sleep better?" },
];

const Coach = () => {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setMessages((m) => [...m, { role: "user", text: t }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, {
        role: "ai",
        text: "Got it. I'm pulling your data… here's what I'd recommend: focus on quality reps over volume tomorrow, hit at least 30g protein at every meal, and aim for 7.5h of sleep. Want me to set reminders?",
      }]);
      setTyping(false);
    }, 1400);
  };

  return (
    <DashboardLayout
      title="AI Coach"
      subtitle="Personalized insights · powered by your training data"
      action={<Button variant="outline" size="sm"><Sparkles className="h-4 w-4" /> New chat</Button>}
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat */}
        <Card className="lg:col-span-2 p-0 bg-gradient-card border-border/50 flex flex-col h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-border/50">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-sm">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-card" />
            </div>
            <div>
              <div className="font-display font-semibold">FORGE Coach</div>
              <div className="text-xs text-muted-foreground">Online · trained on your history</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 animate-fade-in ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "ai" && (
                  <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-gradient-primary text-primary-foreground rounded-br-sm"
                    : "bg-surface-1 border border-border/40 rounded-bl-sm"
                }`}>
                  {m.text}
                </div>
                {m.role === "user" && (
                  <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">A</div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex gap-3 animate-fade-in">
                <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-surface-1 border border-border/40 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-5 pb-3 flex gap-2 overflow-x-auto">
            {quickPrompts.map((q) => (
              <button
                key={q.text}
                onClick={() => send(q.text)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-surface-1 border border-border/40 hover:border-primary/40 hover:text-primary transition-colors"
              >
                <q.icon className="h-3 w-3" /> {q.text}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/50">
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your training..."
                className="bg-surface-1 border-border/40 h-11"
              />
              <Button type="submit" variant="hero" size="icon" className="h-11 w-11 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Side panel */}
        <div className="space-y-4">
          <Card className="p-5 bg-gradient-card border-border/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial-glow opacity-40" />
            <div className="relative">
              <Badge className="bg-primary/15 text-primary border-primary/30 mb-3">Today's focus</Badge>
              <h3 className="font-display text-xl font-bold">Push intensity, not volume.</h3>
              <p className="text-sm text-muted-foreground mt-2">You've built solid base volume. Now drop volume by 10% and add 5–10kg to compound lifts.</p>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-card border-border/50">
            <h3 className="font-display font-semibold text-sm mb-4">Smart insights</h3>
            <div className="space-y-3">
              {[
                { icon: Zap, tone: "primary", text: "Bench PR likely in 5–7 days" },
                { icon: Apple, tone: "warning", text: "28g protein deficit today" },
                { icon: Moon, tone: "accent", text: "Sleep avg 6.2h — recovery dipping" },
                { icon: Target, tone: "success", text: "On pace for 28-session month" },
              ].map((tip, i) => (
                <div key={i} className="flex gap-2.5 p-2.5 rounded-lg bg-surface-1 border border-border/40">
                  <tip.icon className={`h-4 w-4 mt-0.5 shrink-0 ${tip.tone === "primary" ? "text-primary" : tip.tone === "warning" ? "text-warning" : tip.tone === "accent" ? "text-accent" : "text-success"}`} />
                  <p className="text-xs leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 bg-gradient-card border-border/50">
            <h3 className="font-display font-semibold text-sm mb-2">Body status</h3>
            <div className="h-48">
              <MuscleModel3D highlights={["chest", "arms"]} className="h-full w-full" enableControls={false} />
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Coach;
