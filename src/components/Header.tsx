
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleRegister = () => {
    navigate("/auth", { state: { initialMode: "register" } });
  };

  return (
    <header className="w-full px-6 md:px-12 lg:px-24 py-5">
      <div className="mx-auto max-w-[1288px] flex justify-between items-center">
        <div 
          className="font-inter font-bold text-xl md:text-2xl cursor-pointer"
          onClick={() => navigate("/")}
        >
          <span className="font-bold">Cast</span>Companion
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          {user ? (
            <button onClick={handleLogout} className="btn-secondary">
              Abmelden
            </button>
          ) : (
            <>
              <button 
                onClick={() => navigate("/auth")} 
                className="btn-secondary hidden sm:block"
              >
                Anmelden
              </button>
              <button 
                onClick={handleRegister}
                className="btn-primary"
              >
                Registrieren
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
