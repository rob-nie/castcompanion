
import { useState, useEffect, useCallback } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { TimerControls } from "./watch/TimerControls";
import { TimeDisplay } from "./watch/TimeDisplay";
import { useTimer } from "./watch/useTimer";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatTime } from "./watch/utils";

interface WatchTileProps {
  project: Tables<"projects">;
}

export const WatchTile = ({ project }: WatchTileProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Nutze den verbesserten Timer-Hook mit Verbindungsstatus
  const { isRunning, displayTime, toggleTimer, resetTimer, isSyncing, isConnected } = useTimer(project.id);
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

  // Memoized event handler für bessere Performance
  const handleToggle = useCallback(() => {
    if (!isSyncing) {
      toggleTimer();
    }
  }, [toggleTimer, isSyncing]);

  const handleReset = useCallback(() => {
    if (!isSyncing) {
      resetTimer();
    }
  }, [resetTimer, isSyncing]);

  // Keyboard handlers für bessere Zugänglichkeit
  const handleKeyDown = useCallback((handler: Function) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handler(e);
    }
  }, []);

  if (isMobile) {
    return (
      <div className="flex items-center h-10">
        {/* Play/Pause Button - mit verbesserten Touch-Handlern */}
        <div 
          role="button"
          tabIndex={0}
          aria-label={isRunning ? "Pause" : "Play"}
          onClick={handleToggle}
          onTouchEnd={handleToggle} 
          onKeyDown={handleKeyDown(handleToggle)}
          className={`h-10 w-10 flex items-center justify-center rounded-full 
            ${isSyncing ? 'bg-[#14A090]/70 cursor-not-allowed' : 'bg-[#14A090] cursor-pointer active:bg-[#118174]'}
            text-white transition-colors`}
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            WebkitUserSelect: 'none',
            userSelect: 'none'
          }}
        >
          {isSyncing ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : isRunning ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M10 4H6v16h4V4z"/><path d="M18 4h-4v16h4V4z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          )}
        </div>
        
        {/* Timer Tile */}
        <div 
          className={`h-10 flex-1 mx-[23px] flex items-center justify-center rounded-[20px] overflow-hidden select-none ${!isConnected ? 'relative' : ''}`}
          style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #14A090, #CE9F7C)' 
              : 'linear-gradient(135deg, #14A090, #0A2550)'
          }}
        >
          <div
            className="font-inter font-bold text-[20px] text-white text-center"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatTime(displayTime)}
          </div>
        </div>
        
        {/* Reset Button - mit verbesserten Touch-Handlern */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Reset"
          onClick={handleReset}
          onTouchEnd={handleReset}
          onKeyDown={handleKeyDown(handleReset)}
          className={`h-10 w-10 flex items-center justify-center rounded-full 
            ${isSyncing ? 'bg-[#14A090]/70 cursor-not-allowed' : 'bg-[#14A090] cursor-pointer active:bg-[#118174]'}
            text-white transition-colors`}
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            WebkitUserSelect: 'none',
            userSelect: 'none'
          }}
        >
          {isSyncing ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`h-[136px] max-w-[414px] p-6 rounded-[20px] overflow-hidden relative select-none ${!isConnected ? 'relative' : ''}`}
      style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #14A090, #CE9F7C)' 
          : 'linear-gradient(135deg, #14A090, #0A2550)'
      }}
    >
      {!isConnected && (
      )}
      <div className="text-white h-full flex flex-col items-center justify-between">
        <div className="w-full px-3">
          <TimerControls 
            isRunning={isRunning} 
            displayTime={displayTime}
            onToggle={handleToggle} 
            onReset={handleReset}
            isMobile={false}
            isSyncing={isSyncing}
          />
        </div>
        <TimeDisplay currentTime={currentTime} />
      </div>
    </div>
  );
};
