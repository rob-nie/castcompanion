
import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, UserRound } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface HeaderProps {
  currentPage?: string;
  project?: Tables<"projects">;
}

export function Header({ currentPage, project }: HeaderProps) {
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
      <div className="mx-auto max-w-[1288px] flex items-center justify-between">
        <div 
          className="font-inter font-bold text-xl md:text-2xl cursor-pointer text-[#0A1915] dark:text-white"
          onClick={handleLogoClick}
        >
          <span className="font-bold">Cast</span>
          <span className="font-normal">Companion</span>
        </div>
          
        {user && (
          <nav className="absolute left-1/2 transform -translate-x-1/2 flex items-end">
            <a 
              href="/projects"
              className={`relative text-sm mx-3 py-2 ${currentPage === "projects" && !project ? 
                "text-[#14A090] font-medium" : 
                "text-[#7A9992] dark:text-[#CCCCCC] font-normal"} relative
                ${currentPage === "projects" && !project ? "after:absolute after:h-[3px] after:bg-[#14A090] after:left-0 after:right-0 after:bottom-[-1px] after:rounded-full" : ""}
              `}
            >
              Meine Projekte
            </a>
            {project && (
              <a 
                href={`/projects/${project.id}`}
                className="relative text-sm mx-3 py-2 text-[#14A090] font-medium relative after:absolute after:h-[3px] after:bg-[#14A090] after:left-0 after:right-0 after:bottom-[-1px] after:rounded-full"
              >
                {project.title}
              </a>
            )}
          </nav>
        )}
        
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-sm cursor-pointer">
                  <UserRound className="h-4 w-4 text-[#0A1915] dark:text-white" />
                  <span className="hidden md:block font-medium text-[#0A1915] dark:text-white">
                    {user.user_metadata.full_name || user.email}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Einstellungen
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
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
