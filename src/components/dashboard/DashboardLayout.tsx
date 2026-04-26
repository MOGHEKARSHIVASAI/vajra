import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  Activity, Apple, Brain, Droplets, LineChart as LineIcon, Trophy,
  Dumbbell, Bell, Settings, LogOut, Plus, Calendar, ChevronRight, Menu,
  Calculator, CalendarDays, Moon, Shield
} from "lucide-react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/services/firebase";
import { logout } from "@/services/auth";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { icon: Activity, label: "Overview", to: "/dashboard" },
  { icon: Calculator, label: "BMI Intel", to: "/bmi" },
  { icon: CalendarDays, label: "Routine", to: "/routine" },
  { icon: Dumbbell, label: "Workouts", to: "/workouts" },
  { icon: Apple, label: "Nutrition", to: "/nutrition" },
  { icon: Droplets, label: "Hydration", to: "/hydration" },
  { icon: LineIcon, label: "Analytics", to: "/analytics" },
  { icon: Brain, label: "AI Coach", to: "/coach" },
  { icon: Trophy, label: "Challenges", to: "/challenges" },
  { icon: Calendar, label: "Schedule", to: "/schedule" },
  { icon: Moon, label: "Sleep", to: "/sleep" },
  { icon: Shield, label: "Vault", to: "/vault" },
];

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export const DashboardLayout = ({ title, subtitle, action, children }: DashboardLayoutProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState([
    { id: "1", title: "Welcome to FitOS!", message: "Your journey to greatness starts here.", time: "Just now", read: false, type: "system" },
    { id: "2", title: "Daily Goal Hit!", message: "You reached your water intake goal. Stay hydrated!", time: "2h ago", read: false, type: "achievement" },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Get first initial for avatar fallback
  const displayName = user?.displayName || user?.email?.split("@")[0] || "You";
  const initials = displayName.charAt(0).toUpperCase();
  const photoURL = user?.photoURL;
  const SESSION_KEY = "active_workout_session";
  const EXPIRATION_TIME = 3 * 60 * 60 * 1000;
  const [activeSession, setActiveSession] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        try {
          const { start, started } = JSON.parse(savedSession);
          const startTimeDate = new Date(start);
          const now = new Date();
          if (started && (now.getTime() - startTimeDate.getTime()) < EXPIRATION_TIME) {
            setActiveSession(true);
          } else {
            setActiveSession(false);
          }
        } catch (e) {
          setActiveSession(false);
        }
      } else {
        setActiveSession(false);
      }
    };

    checkSession();
    const itv = setInterval(checkSession, 30000);
    return () => clearInterval(itv);
  }, [pathname]);

  const Sidebar = (
    <>
      <div className="px-2 pb-6">
        <Logo size="md" />
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? "bg-gradient-primary text-primary-foreground shadow-glow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              }`}
            >
              <item.icon className="h-4 w-4" strokeWidth={2.2} />
              <span className="font-medium">{item.label}</span>
              {active && <ChevronRight className="ml-auto h-4 w-4" />}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 pt-4 border-t border-border/50">
        <Link 
          to="/settings"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
            pathname === "/settings"
              ? "bg-gradient-primary text-primary-foreground shadow-glow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
          }`}
        >
          <Settings className="h-4 w-4" /> <span className="font-medium">Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden lg:flex flex-col w-60 border-r border-border/50 bg-sidebar p-4 sticky top-0 h-screen">
        {Sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur z-40" onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed top-0 left-0 w-64 h-screen bg-sidebar border-r border-border/50 p-4 z-50 flex flex-col animate-slide-in-right">
            {Sidebar}
          </aside>
        </>
      )}

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border/50 px-4 md:px-8 py-4 flex items-center justify-between gap-3">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl md:text-2xl font-bold truncate">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 bg-popover border-border/50 shadow-2xl" align="end">
                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                      className="text-[10px] uppercase tracking-widest text-primary hover:underline font-bold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <ScrollArea className="h-[300px]">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-border/30">
                      {notifications.map((n) => (
                        <div key={n.id} className={`p-4 hover:bg-muted/50 transition-colors ${!n.read ? "bg-primary/5" : ""}`}>
                          <div className="flex items-start gap-3">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${n.type === "achievement" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"}`}>
                              {n.type === "achievement" ? <Trophy className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold">{n.title}</div>
                              <div className="text-[11px] text-muted-foreground leading-tight mt-1">{n.message}</div>
                              <div className="text-[9px] text-muted-foreground/60 mt-2 uppercase tracking-tighter">{n.time}</div>
                            </div>
                            {!n.read && <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">All caught up!</p>
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
            {action ?? (
              <Button variant="hero" size="sm">
                <Plus className="h-4 w-4" /> Quick add
              </Button>
            )}
            {/* Real user avatar */}
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName}
                title={displayName}
                className="h-9 w-9 rounded-full object-cover border-2 border-primary/40"
              />
            ) : (
              <div
                title={displayName}
                className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground"
              >
                {initials}
              </div>
            )}
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6 animate-fade-in relative">
          {activeSession && pathname !== "/workouts" && (
            <Link to="/workouts" className="block mb-6 animate-in slide-in-from-top-4 duration-500">
              <div className="bg-gradient-ember p-3 rounded-xl flex items-center justify-between shadow-glow-ember hover:scale-[1.01] transition-transform cursor-pointer overflow-hidden relative">
                <div className="absolute inset-0 bg-white/10 opacity-20 animate-pulse" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Dumbbell className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-widest">Active Workout Session</div>
                    <div className="text-[10px] text-white/80">You have a workout in progress. Click to resume tracking!</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-white relative z-10" />
              </div>
            </Link>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
