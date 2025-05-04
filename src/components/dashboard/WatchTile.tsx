
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
  // Erhöhe das Update-Intervall für bessere Synchronisation
  const { isRunning, displayTime, toggleTimer, resetTimer, isSyncing } = useTimer(project.id);
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
  const handleToggle = useCallback((e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isSyncing) {
      toggleTimer();
    }
  }, [toggleTimer, isSyncing]);
  const handleReset = useCallback((e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

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
        <div        <div
          role="button"
          tabIndex={0}
          aria-label={isRunning ? "Pause" : "Play"}
          onClick={handleToggle}
          onTouchEnd={handleToggle} 
          onKeyDown={handleKeyDown(handleToggle)}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${isRunning ? 'bg-[#EF4444]' : 'bg-[#14A090]'} ${isSyncing ? 'opacity-50' : ''}`}
        >
          {isRunning ? (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 14H4V0H0V14ZM8 0V14H12V0H8Z" fill="white"/>
            </svg>
          ) : (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0L12 7L0 14V0Z" fill="white"/>
            </svg>
          )}
        </div>
        
        {/* Timer Display */}
        <div className="mx-4 text-[20px] font-medium">
          {formatTime(displayTime)}
        </div>
        
        {/* Reset Button */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Reset Timer"
          onClick={handleReset}
          onTouchEnd={handleReset}
          onKeyDown={handleKeyDown(handleReset)}
          className={`w-10 h-10 rounded-full border-[0.5px] border-[#CCCCCC] dark:border-[#5E6664] flex items-center justify-center ${isSyncing ? 'opacity-50' : ''}`}
        >
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.00001 2.33333V0L3.66668 3.33333L7.00001 6.66667V4.33333C8.84168 4.33333 10.3333 5.825 10.3333 7.66667C10.3333 9.50833 8.84168 11 7.00001 11C5.15834 11 3.66668 9.50833 3.66668 7.66667H2.33334C2.33334 10.2483 4.41834 12.3333 7.00001 12.3333C9.58168 12.3333 11.6667 10.2483 11.6667 7.66667C11.6667 5.085 9.58168 3 7.00001 3V2.33333Z" fill={isDarkMode ? '#CCCCCC' : '#7A9992'}/>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'w-full' : 'max-w-[414px]'}`}>
      {/* Wrapper div to contain the shadow overflow */}
      <div className="w-full p-6 rounded-[20px] bg-background border-[0.5px] border-[#CCCCCC] dark:border-[#5E6664] shadow-[5px_20px_20px_rgba(0,0,0,0.1)] dark:shadow-[5px_20px_20px_rgba(255,255,255,0.05)]">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="text-xl font-medium mb-2">Timer</h2>
            <div className="text-base text-[#7A9992] dark:text-[#CCCCCC]">
              {currentTime.toLocaleDateString('de-DE', { 
                day: '2-digit', 
                month: '2-digit',
                year: 'numeric' 
              })}
            </div>
          </div>
          <div>
            <TimeDisplay time={displayTime} />
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <TimerControls 
            isRunning={isRunning} 
            onToggle={handleToggle} 
            onReset={handleReset}
            onToggleKeyDown={handleKeyDown(handleToggle)}
            onResetKeyDown={handleKeyDown(handleReset)}
            isSyncing={isSyncing}
          />
        </div>
      </div>
    </div>
  );
};