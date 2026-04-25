import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout, SocialButtons, FormDivider, Button, Input, Label, ArrowRight } from "@/components/auth/AuthLayout";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate("/dashboard"), 600);
  };

  return (
    <AuthLayout
      title="Welcome back."
      subtitle="Log in to keep your streak alive."
      footer={<>New to FORGE? <Link to="/signup" className="text-primary font-semibold hover:underline">Create an account</Link></>}
    >
      <SocialButtons label="Log in" />
      <FormDivider />
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@gym.com" required className="bg-surface-1 border-border/50 h-11" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
          </div>
          <Input id="password" type="password" placeholder="••••••••" required className="bg-surface-1 border-border/50 h-11" />
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : <>Log in <ArrowRight className="h-4 w-4 ml-1" /></>}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login;
