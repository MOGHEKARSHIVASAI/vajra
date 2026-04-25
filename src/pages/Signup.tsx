import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout, SocialButtons, FormDivider, Button, Input, Label, ArrowRight } from "@/components/auth/AuthLayout";

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate("/dashboard"), 600);
  };

  return (
    <AuthLayout
      title="Start your journey."
      subtitle="Free forever. No credit card. 60 seconds."
      footer={<>Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link></>}
    >
      <SocialButtons label="Sign up" />
      <FormDivider />
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Alex Carter" required className="bg-surface-1 border-border/50 h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@gym.com" required className="bg-surface-1 border-border/50 h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="At least 8 characters" required className="bg-surface-1 border-border/50 h-11" />
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating..." : <>Create account <ArrowRight className="h-4 w-4 ml-1" /></>}
        </Button>
        <p className="text-xs text-muted-foreground text-center">By signing up you agree to our Terms & Privacy Policy.</p>
      </form>
    </AuthLayout>
  );
};

export default Signup;
