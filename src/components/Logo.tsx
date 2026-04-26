import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className, size = "md" }: LogoProps) => {
  const sizes = {
    sm: { wrap: "text-lg", icon: "h-5 w-5", box: "h-8 w-8" },
    md: { wrap: "text-xl", icon: "h-5 w-5", box: "h-9 w-9" },
    lg: { wrap: "text-2xl", icon: "h-6 w-6", box: "h-11 w-11" },
  }[size];

  return (
    <Link to="/" className={cn("flex items-center gap-2.5 group", className)}>
      <div className={cn("relative flex items-center justify-center rounded-lg bg-gradient-primary shadow-glow-sm transition-transform group-hover:scale-105", sizes.box)}>
        <Zap className={cn("text-primary-foreground fill-current", sizes.icon)} strokeWidth={2.5} />
        <div className="absolute inset-0 rounded-lg bg-gradient-primary blur-md opacity-50 -z-10" />
      </div>
      <span className={cn("font-display font-bold tracking-tight", sizes.wrap)}>
        VAJRA
      </span>
    </Link>
  );
};
