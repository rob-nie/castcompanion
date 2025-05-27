
import { useState, useRef, useEffect } from 'react';

export interface TimerState {
  isRunning: boolean;
  startTime: string | null;
  accumulatedTime: number;
  displayTime: number;
  isSyncing: boolean;
}

export interface TimerStateRef {
  isRunning: boolean;
  startTime: string | null;
  accumulatedTime: number;
  displayTime: number;
  isSyncing: boolean;
  lastSyncTime: number;
  syncInProgress: boolean;
  pendingChanges: boolean;
  optimisticUpdateId: number;
}

export const useTimerState = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const stateRef = useRef<TimerStateRef>({
    isRunning,
    startTime,
    accumulatedTime,
    displayTime,
    isSyncing,
    lastSyncTime: Date.now(),
    syncInProgress: false,
    pendingChanges: false,
    optimisticUpdateId: 0
  });
  
  // Update reference whenever state changes
  useEffect(() => {
    stateRef.current = {
      ...stateRef.current,
      isRunning,
      startTime,
      accumulatedTime,
      displayTime,
      isSyncing
    };
  }, [isRunning, startTime, accumulatedTime, displayTime, isSyncing]);

  return {
    // State
    isRunning,
    startTime,
    accumulatedTime,
    displayTime,
    isSyncing,
    stateRef,
    // Setters
    setIsRunning,
    setStartTime,
    setAccumulatedTime,
    setDisplayTime,
    setIsSyncing
  };
};
