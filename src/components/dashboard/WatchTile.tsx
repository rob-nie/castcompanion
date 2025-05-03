import { useState, useEffect } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { TimerControls } from "./watch/TimerControls";
import { TimeDisplay } from "./watch/TimeDisplay";
import { useTimer } from "./watch/useTimer";
import { useIsMobile } from "@/hooks/use-mobile";

interface WatchTileProps {
  project: Tables<"projects">;
}

export const WatchTile = ({ project }: WatchTileProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { isRunning, displayTime, toggleTimer, resetTimer } = useTimer(project.id);
  const isMobile = useIsMobile();

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

  if (isMobile) {
    return (
      <div className="flex items-center">
        {/* Play/Pause Button */}
        <button
          onClick={toggleTimer}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-[#14A090] hover:bg-[#14A090]/90 transition-colors text-white"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label={isRunning ? "Pause" : "Play"}
          type="button"
          tabIndex={0}
        >
          {isRunning ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M10 4H6v16h4V4z"/><path d="M18 4h-4v16h4V4z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          )}
        </button>
        
        {/* Timer Tile */}
        <div 
          className="h-10 flex-1 mx-[23px] flex items-center justify-center rounded-[20px] overflow-hidden"
          style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #14A090, #CE9F7C)' 
              : 'linear-gradient(135deg, #14A090, #0A2550)',
            boxShadow: '0 5px 15px rgba(20, 160, 130, 0.5)'
          }}
        >
          <div className="text-white font-inter font-bold text-[20px]" style={{ fontVariantNumeric: "tabular-nums" }}>
            {TimerControls({ 
              isRunning, 
              displayTime, 
              onToggle: toggleTimer, 
              onReset: resetTimer,
              isMobile: true
            })}
          </div>
        </div>
        
        {/* Reset Button */}
        <button
          onClick={resetTimer}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-[#14A090] hover:bg-[#14A090]/90 transition-colors text-white"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label="Reset"
          type="button"
          tabIndex={0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
      </div>
    );
  }

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
        <div className="w-full px-3">
          <TimerControls 
            isRunning={isRunning} 
            displayTime={displayTime}
            onToggle={toggleTimer} 
            onReset={resetTimer}
            isMobile={false}
          />
        </div>
        <TimeDisplay currentTime={currentTime} />
      </div>
    </div>
  );
};
