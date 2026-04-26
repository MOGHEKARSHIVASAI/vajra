import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  User, Mail, Bell, Shield, Palette, Trash2, Save, LogOut, 
  ChevronRight, Github, ExternalLink, Globe, Smartphone,
  Camera, Zap, Info, Key, Eye, EyeOff, Brain
} from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { updateUserProfile } from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/services/firebase";
import { updateProfile } from "firebase/auth";

const Settings = () => {
  const { profile, user, loading } = useUserData();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  
  // App Preferences
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);
  const [biometrics, setBiometrics] = useState(true);
  const [geminiKey, setGeminiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(user?.email || "");
      
      // Load saved preferences
      const prefs = profile.preferences || {};
      if (prefs.notifications !== undefined) setNotifications(prefs.notifications);
      if (prefs.darkMode !== undefined) setDarkMode(prefs.darkMode);
      if (prefs.publicProfile !== undefined) setPublicProfile(prefs.publicProfile);
      if (prefs.biometrics !== undefined) setBiometrics(prefs.biometrics);
      if (prefs.geminiKey !== undefined) setGeminiKey(prefs.geminiKey);
    }
  }, [profile, user]);

  const handleNotificationToggle = async (checked: boolean) => {
    setNotifications(checked);
    if (checked && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("FitOS", { body: "Notifications are now enabled!" });
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Update Firestore
      await updateUserProfile(user.uid, { 
        name,
        preferences: {
          notifications,
          darkMode,
          publicProfile,
          biometrics,
          geminiKey
        }
      });
      
      // Update Firebase Auth Profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }

      toast({
        title: "Preferences Saved",
        description: "Your settings have been updated across all devices.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Settings" subtitle="Loading preferences...">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Settings" 
      subtitle="Manage your account and app preferences"
      action={
        <Button variant="hero" size="sm" onClick={handleUpdateProfile} disabled={saving}>
          {saving ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
        </Button>
      }
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Profile */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="p-6 bg-gradient-card border-border/50 text-center overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-primary opacity-20" />
            <div className="relative pt-4">
              <div className="relative inline-block group">
                <div className="h-24 w-24 rounded-full bg-surface-2 border-4 border-background flex items-center justify-center mx-auto overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">{name || "FitOS User"}</h3>
              <p className="text-sm text-muted-foreground">{email}</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Level {profile?.gamification?.level || 1}
                </Badge>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  {profile?.gamification?.streak || 0} Day Streak
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Membership</h4>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-primary">Elite Pro</span>
                <Badge className="bg-primary text-primary-foreground">Active</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You have full access to all features, including AI Coaching and advanced analytics.
              </p>
            </div>
            <Button variant="outline" className="w-full border-border/40 hover:bg-surface-2">
              Manage Subscription
            </Button>
          </Card>
        </div>

        {/* Right Column: Detailed Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-card border-border/50 overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <h3 className="font-display text-lg font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Profile Information
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="pl-10 bg-surface-1 border-border/40"
                      placeholder="Your name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={email} 
                      disabled 
                      className="pl-10 bg-surface-1/50 border-border/40 opacity-70"
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface-2/50 border border-border/40 flex items-start gap-3">
                <Info className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your display name is visible on the leaderboard and to your AI coach. To change your email, please visit the account security section.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <h3 className="font-display text-lg font-bold flex items-center gap-2">
                <Bell className="h-5 w-5 text-accent" /> App Preferences
              </h3>
            </div>
            <div className="p-6 space-y-0">
              <div className="flex items-center justify-between py-5 border-b border-border/30">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-surface-2 flex items-center justify-center text-muted-foreground">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Push Notifications</div>
                    <div className="text-xs text-muted-foreground">Get reminders for workouts and meals</div>
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={handleNotificationToggle} />
              </div>

              {[
                { icon: Palette, label: "Dark Interface", desc: "Switch between light and dark modes", state: darkMode, setState: setDarkMode },
                { icon: Globe, label: "Public Profile", desc: "Allow other users to see your progress", state: publicProfile, setState: setPublicProfile },
                { icon: Zap, label: "Smart Biometrics", desc: "Auto-sync weight and BMI calculations", state: biometrics, setState: setBiometrics },
              ].map((item, i, arr) => (
                <div key={item.label} className={`flex items-center justify-between py-5 ${i !== arr.length - 1 ? "border-b border-border/30" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-surface-2 flex items-center justify-center text-muted-foreground">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </div>
                  <Switch checked={item.state} onCheckedChange={item.setState} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <h3 className="font-display text-lg font-bold flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" /> AI Configuration
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                  <span>Gemini API Key</span>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    Get Key <ExternalLink className="h-3 w-3" />
                  </a>
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type={showKey ? "text" : "password"}
                    value={geminiKey} 
                    onChange={(e) => setGeminiKey(e.target.value)} 
                    onFocus={(e) => e.target.select()}
                    className="pl-10 pr-10 bg-surface-1 border-border/40 font-mono text-xs"
                    placeholder="Enter your Gemini API key..."
                  />
                  <button 
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-2">
                  Your API key is used locally to power the AI Coach. We recommend using <strong>Gemini 1.5 Flash</strong> for the best balance of speed and intelligence.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <h3 className="font-display text-lg font-bold flex items-center gap-2 text-destructive">
                <Shield className="h-5 w-5" /> Danger Zone
              </h3>
            </div>
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="text-sm font-bold">Delete Account</div>
                <div className="text-xs text-muted-foreground mt-1">Permanently remove all your data and progress. This cannot be undone.</div>
              </div>
              <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4 mr-2" /> Delete Data
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
