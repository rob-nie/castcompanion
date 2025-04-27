
import { useState, useEffect } from "react";
import type { Tables } from "@/integrations/supabase/types";

interface NotesTileProps {
  project: Tables<"projects">;
}

export const NotesTile = ({ project }: NotesTileProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === 'class' &&
          mutation.target === document.documentElement
        ) {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      className="h-full max-w-[851px] p-6 rounded-[20px] overflow-hidden"
      style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #14A090, #CE9F7C)' 
          : 'linear-gradient(135deg, #14A090, #0A2550)',
        boxShadow: '0 5px 15px rgba(20, 160, 130, 0.5)'
      }}
    >
      <h2 className="text-xl font-medium mb-4 text-white">Notes</h2>
      <p className="text-white/80">Coming soon...</p>
    </div>
  );
};
