import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Scale, Activity, Plus } from "lucide-react";
import { logBodyStats } from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";

export function BodyStatsDialog({ uid }: { uid: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [stats, setStats] = useState({
    weight: "",
    bodyFat: "",
    neck: "",
    waist: "",
    chest: "",
    arms: "",
    thighs: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stats.weight) {
      toast({ title: "Weight is required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await logBodyStats(uid, {
        weight: Number(stats.weight),
        bodyFat: stats.bodyFat ? Number(stats.bodyFat) : null,
        neck: stats.neck ? Number(stats.neck) : null,
        waist: stats.waist ? Number(stats.waist) : null,
        chest: stats.chest ? Number(stats.chest) : null,
        arms: stats.arms ? Number(stats.arms) : null,
        thighs: stats.thighs ? Number(stats.thighs) : null,
        date: new Date().toISOString().split("T")[0]
      });

      toast({ title: "Body stats logged!", description: "Progress updated successfully." });
      setOpen(false);
      setStats({
        weight: "",
        bodyFat: "",
        neck: "",
        waist: "",
        chest: "",
        arms: "",
        thighs: ""
      });
    } catch (err) {
      toast({ title: "Error", description: "Failed to log stats.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-border/40 hover:bg-surface-2 w-full md:w-auto">
          <TrendingUp className="h-4 w-4" /> Log Body Stats
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" /> Body Composition
          </DialogTitle>
          <DialogDescription>
            Track your physical progress. Only weight is required.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="weight" className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Body Weight (kg) *</Label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="weight"
                  type="number" 
                  step="0.1"
                  placeholder="e.g. 75.5"
                  className="pl-10 bg-surface-1 border-border/40"
                  value={stats.weight}
                  onChange={(e) => setStats({...stats, weight: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bodyFat" className="text-xs uppercase tracking-widest text-muted-foreground">Body Fat (%)</Label>
              <Input 
                id="bodyFat"
                type="number" 
                step="0.1"
                placeholder="e.g. 15.2"
                className="bg-surface-1 border-border/40"
                value={stats.bodyFat}
                onChange={(e) => setStats({...stats, bodyFat: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waist" className="text-xs uppercase tracking-widest text-muted-foreground">Waist (cm)</Label>
              <Input 
                id="waist"
                type="number" 
                step="0.1"
                placeholder="e.g. 82.0"
                className="bg-surface-1 border-border/40"
                value={stats.waist}
                onChange={(e) => setStats({...stats, waist: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chest" className="text-xs uppercase tracking-widest text-muted-foreground">Chest (cm)</Label>
              <Input 
                id="chest"
                type="number" 
                step="0.1"
                className="bg-surface-1 border-border/40"
                value={stats.chest}
                onChange={(e) => setStats({...stats, chest: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arms" className="text-xs uppercase tracking-widest text-muted-foreground">Arms (cm)</Label>
              <Input 
                id="arms"
                type="number" 
                step="0.1"
                className="bg-surface-1 border-border/40"
                value={stats.arms}
                onChange={(e) => setStats({...stats, arms: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="hero" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : "Save Log"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
