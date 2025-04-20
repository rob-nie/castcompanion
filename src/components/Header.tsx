
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";

interface HeaderProps {
  currentPage?: string;
}

export function Header({ currentPage }: HeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (user) {
      navigate("/projects");
    } else {
      navigate("/");
    }
  };

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
            onClick={handleLogoClick}
          >
            <span className="font-bold">Cast</span>Companion
          </div>
          
          {user && (
            <nav className="hidden sm:flex items-center gap-6">
              <a 
                href="/projects"
                className={`text-sm ${currentPage === "projects" ? "text-[#14A090] font-medium" : "text-[#7A9992] font-normal"}`}
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
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-sm cursor-pointer">
                  <User className="h-4 w-4 text-[#0A1915]" />
                  <span className="hidden md:block font-medium text-[#0A1915]">
                    {user.user_metadata.full_name || user.email}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

