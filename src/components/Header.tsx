import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import type { Tables } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "./ThemeToggle";
import { ProjectSettingsModal } from "./project-settings/ProjectSettingsModal";
import { Logo } from "./header/Logo";
import { UserMenu } from "./header/UserMenu";
import { AuthButtons } from "./header/AuthButtons";
import { ProjectNavigation } from "./header/ProjectNavigation";
import { MobileNavigation } from "./header/MobileNavigation";

interface HeaderProps {
  currentPage?: string;
  project?: Tables<"projects">;
}

export function Header({ currentPage, project }: HeaderProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSettingsModalOpen(true);
  };

  const handleProjectUpdate = () => {
    // Refresh der Seite oder State-Update könnte hier implementiert werden
    // Für einfache Lösung reicht momentan ein Seiten-Refresh
    window.location.reload();
  };

  return (
    <header className="w-full px-6 xl:px-24 py-3 sm:py-5">
      <div className="mx-auto max-w-[1288px] flex flex-col">
        {/* Desktop and Mobile First Row */}
        <div className="w-full flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Center Navigation (only on desktop) */}
          {!isMobile && user && (
            <ProjectNavigation 
              currentPage={currentPage} 
              project={project}
              onSettingsClick={handleSettingsClick}
            />
          )}

          {/* Right Side Controls */}
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            {user ? (
              <UserMenu isMobile={isMobile} />
            ) : (
              <AuthButtons isMobile={isMobile} />
            )}
          </div>
        </div>
        
        {/* Mobile Navigation (second row, only if user is logged in) */}
        {user && isMobile && (
          <MobileNavigation 
            currentPage={currentPage} 
            project={project}
            onSettingsClick={handleSettingsClick}
          />
        )}
      </div>
      
      {/* Project Settings Modal */}
      {project && (
        <ProjectSettingsModal 
          project={project} 
          isOpen={isSettingsModalOpen} 
          onClose={() => setIsSettingsModalOpen(false)}
          onSuccess={handleProjectUpdate}
          isOwner={true} // Hier müsste idealerweise die Owner-Information aus dem Projekt oder vom Server ermittelt werden
        />
      )}
    </header>
  );
}
