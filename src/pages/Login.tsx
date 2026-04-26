import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout, SocialButtons, FormDivider, Button, Input, Label, ArrowRight } from "@/components/auth/AuthLayout";
import { loginEmail, loginGoogle } from "@/services/auth";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    try {
      await loginEmail(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginGoogle();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back."
      subtitle="Log in to keep your streak alive."
      footer={<>New to VAJRA? <Link to="/signup" className="text-primary font-semibold hover:underline">Create an account</Link></>}
    >
      <div className="space-y-2">
        <Button variant="outline" className="w-full" type="button" onClick={handleGoogle} disabled={googleLoading}>
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity=".7"/><path fill="currentColor" d="M5.84 14.1A6.97 6.97 0 0 1 5.47 12c0-.73.13-1.44.36-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.83z" opacity=".5"/></svg>
          {googleLoading ? "Signing in..." : "Continue with Google"}
        </Button>
      </div>
      <FormDivider />
      {error && <p className="text-sm text-destructive text-center mb-3">{error}</p>}
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
