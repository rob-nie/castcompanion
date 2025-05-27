
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TimerStateRef } from './useTimerState';

export const useServerSync = (
  projectId: string,
  stateRef: React.MutableRefObject<TimerStateRef>,
  setIsSyncing: (syncing: boolean) => void
) => {
  const updateServerState = async (newState: {
    is_running?: boolean;
    start_time?: string | null;
    accumulated_time?: number;
  }): Promise<boolean> => {
    if (stateRef.current.syncInProgress) {
      console.warn("Sync already in progress, deferring update");
      return false;
    }
    
    // Generate unique update ID and mark update as pending
    const updateId = Date.now();
    stateRef.current.optimisticUpdateId = updateId;
    stateRef.current.pendingChanges = true;
    stateRef.current.syncInProgress = true;
    setIsSyncing(true);
    
    try {
      const currentTime = new Date().toISOString();
      
      console.info("Updating server state:", newState);
      
      const { error } = await supabase
        .from("project_timers")
        .update({
          ...newState,
          updated_at: currentTime
        })
        .eq("project_id", projectId);
        
      if (error) {
        console.error("Error updating timer:", error);
        stateRef.current.pendingChanges = false;
        stateRef.current.syncInProgress = false;
        stateRef.current.optimisticUpdateId = 0;
        setIsSyncing(false);
        
        toast({
          title: "Synchronisierungsfehler",
          description: "Timer-Änderungen konnten nicht gespeichert werden.",
          variant: "destructive"
        });
        
        return false;
      }
      
      // Update last sync time
      stateRef.current.lastSyncTime = Date.now();
      
      // Reduced timeout for faster response - realtime should handle clearing sync state
      setTimeout(() => {
        if (stateRef.current.syncInProgress && stateRef.current.optimisticUpdateId === updateId) {
          stateRef.current.syncInProgress = false;
          stateRef.current.pendingChanges = false;
          stateRef.current.optimisticUpdateId = 0;
          setIsSyncing(false);
        }
      }, 1000);
      
      return true;
    } catch (error) {
      console.error("Unexpected error updating timer:", error);
      stateRef.current.pendingChanges = false;
      stateRef.current.syncInProgress = false;
      stateRef.current.optimisticUpdateId = 0;
      setIsSyncing(false);
      
      toast({
        title: "Unerwarteter Fehler",
        description: "Bei der Timer-Aktualisierung ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  const syncWithServer = async (
    setIsRunning: (running: boolean) => void,
    setStartTime: (time: string | null) => void,
    setAccumulatedTime: (time: number) => void,
    setDisplayTime: (time: number) => void
  ) => {
    if (stateRef.current.syncInProgress) {
      console.warn("Sync already in progress");
      return;
    }
    
    stateRef.current.syncInProgress = true;
    setIsSyncing(true);
    
    try {
      console.info("Manual sync with server initiated");
      
      const { data, error } = await supabase
        .from("project_timers")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();
        
      if (error) {
        console.error("Error syncing timer:", error);
        stateRef.current.syncInProgress = false;
        setIsSyncing(false);
        
        toast({
          title: "Synchronisierungsfehler",
          description: "Timer-Daten konnten nicht aktualisiert werden.",
          variant: "destructive"
        });
        
        return;
      }
      
      if (data) {
        const newIsRunning = data.is_running || false;
        const newStartTime = data.start_time;
        const newAccumulatedTime = data.accumulated_time || 0;
        
        setIsRunning(newIsRunning);
        setStartTime(newStartTime);
        setAccumulatedTime(newAccumulatedTime);
        
        // Update display time
        if (newIsRunning && newStartTime) {
          const currentTime = new Date().getTime();
          const start = new Date(newStartTime).getTime();
          setDisplayTime(newAccumulatedTime + (currentTime - start));
        } else {
          setDisplayTime(newAccumulatedTime);
        }
        
        stateRef.current.lastSyncTime = Date.now();
      }
      
      stateRef.current.syncInProgress = false;
      setIsSyncing(false);
    } catch (error) {
      console.error("Unexpected error during sync:", error);
      stateRef.current.syncInProgress = false;
      setIsSyncing(false);
      
      toast({
        title: "Synchronisierungsfehler",
        description: "Bei der Timer-Synchronisierung ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }
  };

  return {
    updateServerState,
    syncWithServer
  };
};
