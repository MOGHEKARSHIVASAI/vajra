import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout, SocialButtons, FormDivider, Button, Input, Label, ArrowRight } from "@/components/auth/AuthLayout";
import { loginEmail, loginGoogle } from "@/services/auth";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginEmail(formData.email, formData.password);
      toast.success("Welcome back! 💪");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginGoogle();
      toast.success("Signed in with Google! 🚀");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back."
      subtitle="Log in to keep your streak alive."
      footer={<>New to FORGE? <Link to="/signup" className="text-primary font-semibold hover:underline">Create an account</Link></>}
    >
      <SocialButtons 
        label="Log in" 
        onGoogleClick={handleGoogleLogin}
        onAppleClick={() => toast.info("Apple login coming soon! 🍎")}
      />
      <FormDivider />
      <form onSubmit={handleAuth} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="you@gym.com" 
            required 
            className="bg-surface-1 border-border/50 h-11" 
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
          </div>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            required 
            className="bg-surface-1 border-border/50 h-11" 
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : <>Log in <ArrowRight className="h-4 w-4 ml-1" /></>}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login;
