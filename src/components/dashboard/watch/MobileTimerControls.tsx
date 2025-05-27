
import { useState, useEffect, useCallback } from "react";
import { formatTime } from "./utils";

interface MobileTimerControlsProps {
  isRunning: boolean;
  displayTime: number;
  toggleTimer: () => void;
  resetTimer: () => void;
  isSyncing: boolean;
  isDarkMode: boolean;
}

export const MobileTimerControls = ({
  isRunning,
  displayTime,
  toggleTimer,
  resetTimer,
  isSyncing,
  isDarkMode
}: MobileTimerControlsProps) => {
  const [optimisticIsRunning, setOptimisticIsRunning] = useState<boolean | null>(null);
  const [optimisticLastAction, setOptimisticLastAction] = useState<'toggle' | 'reset' | null>(null);

  // Reset optimistic state when server state changes or sync completes
  useEffect(() => {
    if (!isSyncing && optimisticIsRunning !== null) {
      setOptimisticIsRunning(null);
      setOptimisticLastAction(null);
    }
  }, [isSyncing, isRunning, optimisticIsRunning]);

  const handleToggle = useCallback(() => {
    if (!isSyncing) {
      setOptimisticIsRunning(!isRunning);
      setOptimisticLastAction('toggle');
      toggleTimer();
    }
  }, [toggleTimer, isSyncing, isRunning]);

  const handleReset = useCallback(() => {
    if (!isSyncing) {
      setOptimisticIsRunning(false);
      setOptimisticLastAction('reset');
      resetTimer();
    }
  }, [resetTimer, isSyncing]);

  const handleKeyDown = useCallback((handler: Function) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handler(e);
    }
  }, []);

  const currentIsRunning = optimisticIsRunning !== null ? optimisticIsRunning : isRunning;
  const showSyncingState = isSyncing && optimisticLastAction !== null;

  return (
    <div className="flex items-center h-10">
      {/* Play/Pause Button */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={currentIsRunning ? "Pause" : "Play"}
        onClick={handleToggle}
        onTouchEnd={handleToggle} 
        onKeyDown={handleKeyDown(handleToggle)}
        className={`h-10 w-10 flex items-center justify-center rounded-full 
          ${showSyncingState ? 'bg-[#14A090]/70 cursor-not-allowed' : 'bg-[#14A090] cursor-pointer active:bg-[#118174]'}
          text-white transition-colors duration-150`}
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
      >
        {showSyncingState ? (
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : currentIsRunning ? (
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
        className="h-10 flex-1 mx-[23px] flex items-center justify-center rounded-[20px] overflow-hidden select-none"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #14A090, #CE9F7C)' 
            : 'linear-gradient(135deg, #14A090, #0A2550)'
        }}
      >
        <div
          className="font-inter font-bold text-[20px] text-white text-center transition-opacity duration-150"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatTime(displayTime)}
        </div>
      </div>
      
      {/* Reset Button */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Reset"
        onClick={handleReset}
        onTouchEnd={handleReset}
        onKeyDown={handleKeyDown(handleReset)}
        className={`h-10 w-10 flex items-center justify-center rounded-full 
          ${showSyncingState && optimisticLastAction === 'reset' ? 'bg-[#14A090]/70 cursor-not-allowed' : 'bg-[#14A090] cursor-pointer active:bg-[#118174]'}
          text-white transition-colors duration-150`}
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
      >
        {showSyncingState && optimisticLastAction === 'reset' ? (
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
};
