
import { useState, useEffect, useCallback } from "react";
import { TimerControls } from "./TimerControls";
import { TimeDisplay } from "./TimeDisplay";

interface DesktopTimerWrapperProps {
  isRunning: boolean;
  displayTime: number;
  toggleTimer: () => void;
  resetTimer: () => void;
  isSyncing: boolean;
  currentTime: Date;
  isDarkMode: boolean;
}

export const DesktopTimerWrapper = ({
  isRunning,
  displayTime,
  toggleTimer,
  resetTimer,
  isSyncing,
  currentTime,
  isDarkMode
}: DesktopTimerWrapperProps) => {
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

  const currentIsRunning = optimisticIsRunning !== null ? optimisticIsRunning : isRunning;
  const showSyncingState = isSyncing && optimisticLastAction !== null;

  return (
    <div 
      className="h-[136px] max-w-[414px] p-6 rounded-[20px] overflow-hidden relative select-none"
      style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #14A090, #CE9F7C)' 
          : 'linear-gradient(135deg, #14A090, #0A2550)'
      }}
    >
      <div className="text-white h-full flex flex-col items-center justify-between">
        <div className="w-full px-3">
          <TimerControls 
            isRunning={currentIsRunning} 
            displayTime={displayTime}
            onToggle={handleToggle} 
            onReset={handleReset}
            isMobile={false}
            isSyncing={showSyncingState}
            optimisticLastAction={optimisticLastAction}
          />
        </div>
        <TimeDisplay currentTime={currentTime} />
      </div>
    </div>
  );
};
