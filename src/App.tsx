import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Workouts from "./pages/Workouts.tsx";
import Nutrition from "./pages/Nutrition.tsx";
import Hydration from "./pages/Hydration.tsx";
import Analytics from "./pages/Analytics.tsx";
import Coach from "./pages/Coach.tsx";
import Challenges from "./pages/Challenges.tsx";
import Schedule from "./pages/Schedule.tsx";
import BMI from "./pages/BMI.tsx";
import Routine from "./pages/Routine.tsx";
import Settings from "./pages/Settings.tsx";
import Sleep from "./pages/Sleep.tsx";
import Vault from "./pages/Vault.tsx";
import NotFound from "./pages/NotFound.tsx";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/hydration" element={<Hydration />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/bmi" element={<BMI />} />
            <Route path="/routine" element={<Routine />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/sleep" element={<Sleep />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
