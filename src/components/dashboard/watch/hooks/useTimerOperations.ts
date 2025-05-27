
import type { TimerStateRef } from './useTimerState';

export const useTimerOperations = (
  stateRef: React.MutableRefObject<TimerStateRef>,
  updateServerState: (newState: {
    is_running?: boolean;
    start_time?: string | null;
    accumulated_time?: number;
  }) => Promise<boolean>,
  setIsRunning: (running: boolean) => void,
  setStartTime: (time: string | null) => void,
  setAccumulatedTime: (time: number) => void,
  setDisplayTime: (time: number) => void
) => {
  const toggleTimer = async () => {
    if (stateRef.current.syncInProgress) {
      console.warn("Sync in progress, cannot toggle timer");
      return;
    }
    
    const currentTime = new Date();
    
    if (stateRef.current.isRunning) {
      // Calculate current elapsed time
      const elapsedTime = stateRef.current.startTime 
        ? stateRef.current.accumulatedTime + (currentTime.getTime() - new Date(stateRef.current.startTime).getTime())
        : stateRef.current.accumulatedTime;
      
      // Optimistic UI update
      setIsRunning(false);
      setStartTime(null);
      setAccumulatedTime(elapsedTime);
      setDisplayTime(elapsedTime);
      
      // Server update
      updateServerState({
        is_running: false,
        start_time: null,
        accumulated_time: elapsedTime
      });
    } else {
      const newStartTime = currentTime.toISOString();
      
      // Optimistic UI update
      setIsRunning(true);
      setStartTime(newStartTime);
      
      // Server update
      updateServerState({
        is_running: true,
        start_time: newStartTime,
        accumulated_time: stateRef.current.accumulatedTime
      });
    }
  };

  const resetTimer = async () => {
    if (stateRef.current.syncInProgress) {
      console.warn("Sync in progress, cannot reset timer");
      return;
    }
    
    // Optimistic UI update
    setIsRunning(false);
    setStartTime(null);
    setAccumulatedTime(0);
    setDisplayTime(0);
    
    // Server update
    updateServerState({
      is_running: false,
      start_time: null,
      accumulated_time: 0
    });
  };

  return {
    toggleTimer,
    resetTimer
  };
};
