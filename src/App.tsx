
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import Settings from "./pages/Settings";
import { useAuth } from "./context/AuthProvider";
import ProjectDashboard from "./pages/ProjectDashboard";
import { Footer } from "./components/Footer";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Laden...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Layout component that includes Footer for all pages except Dashboard
const LayoutWithFooter = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Footer />
    </>
  );
};

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Laden...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={
        user ? 
        <Navigate to="/projects" replace /> : 
        <LayoutWithFooter><Navigate to="/auth" replace /></LayoutWithFooter>
      } />
      <Route path="/auth/*" element={
        user ? 
        <Navigate to="/projects" replace /> : 
        <LayoutWithFooter><Auth /></LayoutWithFooter>
      } />
      <Route path="/projects" element={
        <ProtectedRoute>
          <LayoutWithFooter><Projects /></LayoutWithFooter>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <LayoutWithFooter><Settings /></LayoutWithFooter>
        </ProtectedRoute>
      } />
      <Route path="/projects/:projectId" element={
        <ProtectedRoute>
          <ProjectDashboard />
        </ProtectedRoute>
      } />
      <Route path="*" element={<LayoutWithFooter><NotFound /></LayoutWithFooter>} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
