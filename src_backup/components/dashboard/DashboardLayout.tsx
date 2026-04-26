import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/auth";
import { useAuth } from "@/hooks/useAuth";
import {
  Activity, Apple, Brain, Droplets, LineChart as LineIcon, Trophy,
  Dumbbell, Bell, Settings, LogOut, Plus, Calendar, ChevronRight, Menu,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: Activity, label: "Overview", to: "/dashboard" },
  { icon: Dumbbell, label: "Workouts", to: "/workouts" },
  { icon: Apple, label: "Nutrition", to: "/nutrition" },
  { icon: Droplets, label: "Hydration", to: "/hydration" },
  { icon: LineIcon, label: "Analytics", to: "/analytics" },
  { icon: Brain, label: "AI Coach", to: "/coach" },
  { icon: Trophy, label: "Challenges", to: "/challenges" },
  { icon: Calendar, label: "Schedule", to: "/schedule" },
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
  const { user, profile } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors">
          <Settings className="h-4 w-4" /> Settings
        </button>
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
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
            </Button>
            {action ?? (
              <Button variant="hero" size="sm">
                <Plus className="h-4 w-4" /> Quick add
              </Button>
            )}
            <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">A</div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6 animate-fade-in">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
