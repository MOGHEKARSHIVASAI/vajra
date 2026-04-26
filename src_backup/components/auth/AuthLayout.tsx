import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { MuscleModel3D } from "@/components/MuscleModel3D";
import { ArrowRight, Flame, Trophy, Target } from "lucide-react";
import { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left form */}
      <div className="flex flex-col p-6 md:p-10">
        <Logo />
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-sm animate-fade-in-up">
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-6 text-sm text-muted-foreground text-center">{footer}</div>
          </div>
        </div>
      </div>

      {/* Right brand panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-card border-l border-border/50">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-radial-glow" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-semibold">
              <Flame className="h-3.5 w-3.5 text-primary" />
              <span className="gradient-text">Train smarter, not longer.</span>
            </div>
            <h2 className="font-display text-3xl xl:text-4xl font-bold leading-tight max-w-md">
              Where <span className="gradient-text">elite athletes</span> log every rep.
            </h2>
          </div>

          <div className="relative h-[400px]">
            <MuscleModel3D highlights={["chest", "arms", "core", "legs"]} enableControls={false} className="absolute inset-0" />
            <Card className="absolute top-4 right-0 glass p-3 px-4 animate-float">
              <div className="flex items-center gap-2.5">
                <Trophy className="h-4 w-4 text-primary" />
                <div className="text-sm font-bold">+540 XP today</div>
              </div>
            </Card>
            <Card className="absolute bottom-8 left-0 glass p-3 px-4 animate-float" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-2.5">
                <Target className="h-4 w-4 text-accent" />
                <div className="text-sm font-bold">Goal: 90% hit</div>
              </div>
            </Card>
          </div>

          <p className="text-sm text-muted-foreground">"FORGE turned my training around. The AI coach is brutally honest." — Marcus T., Powerlifter</p>
        </div>
      </div>
    </div>
  );
};

interface SocialButtonsProps { 
  onGoogleClick?: () => void;
  onAppleClick?: () => void;
  label: string;
}

export const SocialButtons = ({ onGoogleClick, onAppleClick, label }: SocialButtonsProps) => (
  <div className="space-y-2">
    <Button variant="outline" className="w-full" type="button" onClick={onGoogleClick}>
      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity=".7"/><path fill="currentColor" d="M5.84 14.1A6.97 6.97 0 0 1 5.47 12c0-.73.13-1.44.36-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.83z" opacity=".5"/></svg>
      Continue with Google
    </Button>
    <Button variant="outline" className="w-full" type="button" onClick={onAppleClick}>
      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
      Continue with Apple
    </Button>
  </div>
);

export const FormDivider = () => (
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-background px-2 text-muted-foreground tracking-wider">Or</span>
    </div>
  </div>
);

export { Button, Input, Label, ArrowRight };
