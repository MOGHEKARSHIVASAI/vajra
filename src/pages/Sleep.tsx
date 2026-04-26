import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Moon, Sun, Clock, Zap, Activity, Brain, 
  TrendingUp, Star, ChevronRight, Info, Plus
} from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { logSleep } from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, 
  Tooltip, XAxis, YAxis, BarChart, Bar
} from "recharts";

const Sleep = () => {
  const { user, sleepLogs, loading } = useUserData();
  const { toast } = useToast();
  const [bedtime, setBedtime] = useState("22:30");
  const [wakeup, setWakeup] = useState("06:30");
  const [deep, setDeep] = useState("");
  const [rem, setRem] = useState("");
  const [light, setLight] = useState("");
  const [awake, setAwake] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  const calculateDuration = (start: string, end: string) => {
    const [sH, sM] = start.split(":").map(Number);
    const [eH, eM] = end.split(":").map(Number);
    let diff = (eH * 60 + eM) - (sH * 60 + sM);
    if (diff < 0) diff += 24 * 60; // Next day
    return (diff / 60).toFixed(1);
  };

  const handleLogSleep = async () => {
    if (!user) return;
    setIsLogging(true);
    try {
      const duration = parseFloat(calculateDuration(bedtime, wakeup));
      await logSleep(user.uid, {
        bedtime,
        wakeup,
        duration,
        deep: parseFloat(deep) || 0,
        rem: parseFloat(rem) || 0,
        light: parseFloat(light) || 0,
        awake: parseFloat(awake) || 0,
        quality: duration > 7 ? "Great" : duration > 6 ? "Good" : "Low",
        date: new Date().toISOString().split("T")[0]
      });
      toast({ title: "Sleep Logged", description: "Your rest has been recorded." });
      setDeep(""); setRem(""); setLight(""); setAwake("");
    } catch (err) {
      toast({ title: "Error", description: "Failed to log sleep.", variant: "destructive" });
    } finally {
      setIsLogging(false);
    }
  };

  const sortedLogs = [...(sleepLogs || [])].sort((a, b) => b.date.localeCompare(a.date));
  const lastSleep = sortedLogs[0];

  return (
    <DashboardLayout 
      title="Sleep Performance" 
      subtitle="Rest is where the growth happens"
    >
      <div className="grid lg:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-8">
          {/* Main Status */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 p-8 bg-gradient-to-br from-indigo-900/40 to-surface-1 border-indigo-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Moon className="h-32 w-32 text-indigo-400" />
              </div>
              <div className="relative">
                <Badge className="bg-indigo-500/20 text-indigo-300 border-0 mb-4">Last Night's Rest</Badge>
                <div className="flex items-end gap-3 mb-2">
                  <h2 className="text-5xl font-display font-bold text-white">{lastSleep?.duration || "0.0"}</h2>
                  <span className="text-xl text-indigo-300/60 mb-2">Hours</span>
                </div>
                <p className="text-indigo-200/70 text-sm">
                  {lastSleep ? `You slept from ${lastSleep.bedtime} to ${lastSleep.wakeup}` : "No data logged for last night."}
                </p>
                
                {lastSleep && (
                  <div className="grid grid-cols-4 gap-4 mt-8">
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase text-indigo-300/50 font-bold">Deep</div>
                      <div className="text-lg font-bold text-indigo-100">{lastSleep.deep}h</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase text-indigo-300/50 font-bold">REM</div>
                      <div className="text-lg font-bold text-indigo-100">{lastSleep.rem}h</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase text-indigo-300/50 font-bold">Light</div>
                      <div className="text-lg font-bold text-indigo-100">{lastSleep.light}h</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase text-indigo-300/50 font-bold">Awake</div>
                      <div className="text-lg font-bold text-indigo-100">{lastSleep.awake}h</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50 flex flex-col justify-between">
              <div>
                <Brain className="h-6 w-6 text-accent mb-4" />
                <h3 className="font-display font-bold text-lg">Recovery Score</h3>
                <p className="text-xs text-muted-foreground mt-1">Based on sleep depth and heart rate variability.</p>
              </div>
              <div className="mt-6">
                <div className="text-3xl font-display font-bold text-accent">{lastSleep ? Math.min(Math.round((lastSleep.duration / 8) * 100), 100) : 0}%</div>
                <div className="w-full bg-surface-2 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-accent h-full transition-all duration-1000" 
                    style={{ width: `${lastSleep ? (lastSleep.duration / 8) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* History Chart */}
          <Card className="p-6 bg-gradient-card border-border/50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-display font-bold text-xl uppercase tracking-tight">Sleep Consistency</h3>
                <p className="text-xs text-muted-foreground">Hours slept over last 7 entries</p>
              </div>
              <TrendingUp className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[...sortedLogs].reverse()}>
                  <defs>
                    <linearGradient id="sleepG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => v.split('-').slice(1).join('/')} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[0, 12]} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }} />
                  <Area type="monotone" dataKey="duration" stroke="#818cf8" strokeWidth={3} fill="url(#sleepG)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Logger */}
          <Card className="p-6 border-indigo-500/20 bg-indigo-950/10 backdrop-blur-xl">
            <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
              <Plus className="h-5 w-5" /> Log Sleep
            </h3>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Bedtime</Label>
                  <div className="relative">
                    <Moon className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-indigo-400" />
                    <Input 
                      type="time" 
                      value={bedtime} 
                      onChange={(e) => setBedtime(e.target.value)}
                      className="pl-8 bg-surface-1 border-border/40 h-9 text-xs" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Wakeup</Label>
                  <div className="relative">
                    <Sun className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-amber-400" />
                    <Input 
                      type="time" 
                      value={wakeup} 
                      onChange={(e) => setWakeup(e.target.value)}
                      className="pl-8 bg-surface-1 border-border/40 h-9 text-xs" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/30">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 block">Detailed Stages (optional)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground">Deep (h)</span>
                    <Input placeholder="1.5" value={deep} onChange={(e) => setDeep(e.target.value)} className="bg-surface-1 border-border/40 h-8 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground">REM (h)</span>
                    <Input placeholder="2.1" value={rem} onChange={(e) => setRem(e.target.value)} className="bg-surface-1 border-border/40 h-8 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground">Light (h)</span>
                    <Input placeholder="3.8" value={light} onChange={(e) => setLight(e.target.value)} className="bg-surface-1 border-border/40 h-8 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground">Awake (h)</span>
                    <Input placeholder="0.2" value={awake} onChange={(e) => setAwake(e.target.value)} className="bg-surface-1 border-border/40 h-8 text-xs" />
                  </div>
                </div>
              </div>

              <Button 
                variant="hero" 
                className="w-full mt-2" 
                onClick={handleLogSleep}
                disabled={isLogging}
              >
                {isLogging ? "Recording..." : "Log Rest Session"}
              </Button>
            </div>
          </Card>

          {/* Quick Tips */}
          <Card className="p-5 bg-surface-1 border-border/40">
            <h4 className="text-xs font-bold uppercase mb-4 flex items-center gap-2">
              <Info className="h-3 w-3" /> Rest Insights
            </h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                  <Star className="h-3 w-3" />
                </div>
                <p className="text-[10px] leading-relaxed text-muted-foreground">Aim for 1.5 - 2 hours of Deep sleep for physical muscle repair.</p>
              </div>
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                  <Activity className="h-3 w-3" />
                </div>
                <p className="text-[10px] leading-relaxed text-muted-foreground">Consistency matters. Try to wake up at the same time every day.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Sleep;
