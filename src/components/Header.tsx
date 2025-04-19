
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  currentPage?: string;
}

export function Header({ currentPage }: HeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <header className="w-full px-6 md:px-12 lg:px-24 py-5">
      <div className="mx-auto max-w-[1288px] flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div 
            className="font-inter font-bold text-xl md:text-2xl cursor-pointer"
            onClick={() => navigate("/")}
          >
            <span className="font-bold">Cast</span>Companion
          </div>
          
          {user && (
            <nav className="hidden sm:flex items-center gap-6">
              <a 
                href="/projects"
                className={`text-sm ${currentPage === "projects" ? "text-primary font-medium" : "text-secondary font-normal"}`}
              >
                Meine Projekte
              </a>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-secondary hidden md:block">
                {user.email}
              </span>
              <button onClick={handleLogout} className="btn-secondary">
                Abmelden
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => navigate("/auth")} 
                className="btn-secondary hidden sm:block"
              >
                Anmelden
              </button>
              <button 
                onClick={() => navigate("/auth/register")}
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
