
import { useEffect } from 'react';
import { useInterval } from "@/hooks/useInterval";
import { useTimerState } from './hooks/useTimerState';
import { useServerSync } from './hooks/useServerSync';
import { useRealtimeSubscription } from './hooks/useRealtimeSubscription';
import { useTimerOperations } from './hooks/useTimerOperations';

export const useTimer = (projectId: string) => {
  const {
    isRunning,
    startTime,
    accumulatedTime,
    displayTime,
    isSyncing,
    stateRef,
    setIsRunning,
    setStartTime,
    setAccumulatedTime,
    setDisplayTime,
    setIsSyncing
  } = useTimerState();

  const { updateServerState, syncWithServer } = useServerSync(
    projectId,
    stateRef,
    setIsSyncing
  );

  const { isConnected } = useRealtimeSubscription(
    projectId,
    stateRef,
    setIsRunning,
    setStartTime,
    setAccumulatedTime,
    setDisplayTime,
    setIsSyncing
  );

  const { toggleTimer, resetTimer } = useTimerOperations(
    stateRef,
    updateServerState,
    setIsRunning,
    setStartTime,
    setAccumulatedTime,
    setDisplayTime
  );

  // Update the display time continuously while running
  useInterval(() => {
    if (stateRef.current.isRunning && stateRef.current.startTime) {
      const currentTime = new Date().getTime();
      const start = new Date(stateRef.current.startTime).getTime();
      setDisplayTime(stateRef.current.accumulatedTime + (currentTime - start));
    }
  }, stateRef.current.isRunning ? 100 : null);

  // Periodic sync safety check
  useEffect(() => {
    const syncInterval = setInterval(() => {
      // If timer is running and last sync was more than 15 seconds ago, re-sync
      if (stateRef.current.isRunning && 
          Date.now() - stateRef.current.lastSyncTime > 15000 && 
          !stateRef.current.syncInProgress) {
        syncWithServer(setIsRunning, setStartTime, setAccumulatedTime, setDisplayTime);
      }
    }, 15000);

    return () => clearInterval(syncInterval);
  }, [syncWithServer, setIsRunning, setStartTime, setAccumulatedTime, setDisplayTime, stateRef]);

  const manualSyncWithServer = () => {
    syncWithServer(setIsRunning, setStartTime, setAccumulatedTime, setDisplayTime);
  };

  return {
    isRunning,
    displayTime,
    toggleTimer,
    resetTimer,
    isSyncing,
    isConnected,
    syncWithServer: manualSyncWithServer
  };
};
