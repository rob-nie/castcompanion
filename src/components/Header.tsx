
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  currentPage?: string;
  project?: Tables<"projects">;
}

export function Header({ currentPage, project }: HeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  const getUserInitials = () => {
    if (!user) return "";
    
    if (user.user_metadata.full_name) {
      const nameParts = user.user_metadata.full_name.split(" ");
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    }
    
    return user.email ? user.email[0].toUpperCase() : "";
  };

  return (
    <header className="w-full px-6 xl:px-24 py-3 sm:py-5">
      <div className="mx-auto max-w-[1288px] flex items-center justify-between">
        {/* Logo */}
        <div 
          className="font-inter font-bold text-xl md:text-2xl cursor-pointer text-[#0A1915] dark:text-white"
          onClick={handleLogoClick}
        >
          <span className="font-bold">Cast</span>
          <span className="font-extralight">Companion</span>
        </div>
        
        {/* Navigation (only if user is logged in) - Hidden on mobile, centered on desktop */}
        {user && !isMobile && (
          <nav className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center">
            <a 
              href="/projects"
              className={`relative text-sm mr-3 py-0 pb-1 ${currentPage === "projects" && !project ? 
                "text-[#14A090] font-medium" : 
                "text-[#7A9992] dark:text-[#CCCCCC] font-normal"} relative
                ${currentPage === "projects" && !project ? "after:absolute after:h-[3px] after:bg-[#14A090] after:left-0 after:right-0 after:bottom-[-1px] after:rounded-full" : ""}
              shadow-none !shadow-none [--tw-shadow:none]
            `}
            >
              Meine Projekte
            </a>
            {project && (
              <div className="relative flex items-end">
                <a 
                  href={`/projects/${project.id}`}
                  className="text-sm text-[#14A090] font-medium max-w-[40ch] truncate pb-1"
                  title={project.title}
                >
                  {project.title.length > 40 ? `${project.title.substring(0, 40)}...` : project.title}
                </a>
                <div className="absolute h-[3px] bg-[#14A090] left-0 right-0 bottom-[-1px] rounded-full"></div>
              </div>
            )}
          </nav>
        )}
        
        {/* User Menu */}
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-sm cursor-pointer">
                {isMobile ? (
                  <Avatar className="h-9 w-9 bg-[#14A090] text-white">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                ) : (
                  <span className="font-medium text-[#0A1915] dark:text-white">
                    {user.user_metadata.full_name || user.email}
                  </span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Einstellungen
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {!isMobile && (
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
            </>
          )}
        </div>
        
        {/* Mobile Navigation (only if user is logged in) */}
        {user && isMobile && (
          <div className="w-full mt-2">
            <nav className="flex items-end">
              <a 
                href="/projects"
                className={`relative text-sm mr-3 py-0 pb-1 ${currentPage === "projects" && !project ? 
                  "text-[#14A090] font-medium" : 
                  "text-[#7A9992] dark:text-[#CCCCCC] font-normal"} relative
                  ${currentPage === "projects" && !project ? "after:absolute after:h-[3px] after:bg-[#14A090] after:left-0 after:right-0 after:bottom-[-1px] after:rounded-full" : ""}
                shadow-none !shadow-none [--tw-shadow:none]
              `}
              >
                Meine Projekte
              </a>
              {project && (
                <div className="relative flex items-end">
                  <a 
                    href={`/projects/${project.id}`}
                    className="text-sm text-[#14A090] font-medium max-w-[40ch] truncate pb-1"
                    title={project.title}
                  >
                    {project.title.length > 40 ? `${project.title.substring(0, 40)}...` : project.title}
                  </a>
                  <div className="absolute h-[3px] bg-[#14A090] left-0 right-0 bottom-[-1px] rounded-full"></div>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}