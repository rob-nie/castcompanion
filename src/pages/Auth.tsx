
import { useState, useEffect } from "react"; // useEffect hinzufügen
import { useLocation, useNavigate, Navigate, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthProvider";

const Auth = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // useLocation hinzufügen
  const [initialRoute, setInitialRoute] = useState("/login"); // Zustand für die initiale Route

  useEffect(() => {
    // Beim Mounten prüfen wir den state und setzen die initiale Route
    if (location.state?.initialMode === "register") {
      setInitialRoute("/register");
    } else {
      setInitialRoute("/login");
    }
  }, [location.state]); // Abhängigkeit von location.state, damit bei Änderungen reagiert wird

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      if (error) throw error;
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
      navigate("/auth/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center px-6 py-16">
        <Routes>
          <Route path="/login" element={<LoginForm onSubmit={handleLogin} isLoading={isLoading} />} />
          <Route path="/register" element={<RegisterForm onSubmit={handleRegister} isLoading={isLoading} />} />
          <Route path="*" element={<Navigate to={`/auth${initialRoute}`} replace />} /> {/* Dynamische Weiterleitung */}
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
