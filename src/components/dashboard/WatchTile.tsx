
import { useState, useEffect } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { TimerControls } from "./watch/TimerControls";
import { TimeDisplay } from "./watch/TimeDisplay";
import { useTimer } from "./watch/useTimer";

interface WatchTileProps {
  project: Tables<"projects">;
}

export const WatchTile = ({ project }: WatchTileProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { isRunning, displayTime, toggleTimer, resetTimer } = useTimer(project.id);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

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

    return () => {
      clearInterval(timeInterval);
      observer.disconnect();
    };
  }, []);

  return (
    <div 
      className="h-[136px] max-w-[414px] p-6 rounded-[20px] overflow-hidden relative"
      style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #14A090, #CE9F7C)' 
          : 'linear-gradient(135deg, #14A090, #0A2550)',
        boxShadow: '0 5px 15px rgba(20, 160, 130, 0.5)'
      }}
    >
      <div className="text-white h-full flex flex-col items-center justify-between">
        <TimerControls 
          isRunning={isRunning} 
          displayTime={displayTime}
          onToggle={toggleTimer} 
          onReset={resetTimer} 
        />
        <TimeDisplay currentTime={currentTime} />
      </div>
    </div>
  );
};
