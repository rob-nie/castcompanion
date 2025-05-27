
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useInterval } from "@/hooks/useInterval";
import { toast } from "@/components/ui/use-toast";

export const useTimer = (projectId: string) => {
  // Core state
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  
  // References for consistent state handling across renders
  const stateRef = useRef({
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

  // Setup channel and initial data fetch
  useEffect(() => {
    let channel: any;
    let mounted = true;
    
    const initializeTimer = async () => {
      try {
        setIsSyncing(true);
        stateRef.current.syncInProgress = true;
        
        // Fetch current timer state
        const { data, error } = await supabase
          .from("project_timers")
          .select("*")
          .eq("project_id", projectId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching timer data:", error);
          if (mounted) {
            toast({
              title: "Synchronisierungsfehler",
              description: "Timer-Daten konnten nicht geladen werden. Bitte versuche es später erneut.",
              variant: "destructive"
            });
            setIsSyncing(false);
            stateRef.current.syncInProgress = false;
          }
          return;
        }

        // Initialize timer if it doesn't exist
        if (!data) {
          try {
            await supabase
              .from("project_timers")
              .insert([{ 
                project_id: projectId,
                is_running: false,
                start_time: null,
                accumulated_time: 0 
              }]);
            
            // Set initial state
            if (mounted) {
              setIsRunning(false);
              setStartTime(null);
              setAccumulatedTime(0);
              setDisplayTime(0);
            }
          } catch (insertError) {
            console.error("Error creating timer:", insertError);
            if (mounted) {
              toast({
                title: "Fehler beim Erstellen",
                description: "Timer konnte nicht initialisiert werden.",
                variant: "destructive"
              });
            }
          }
        } else {
          // Set state from fetched data
          if (mounted) {
            const newIsRunning = data.is_running || false;
            const newStartTime = data.start_time;
            const newAccumulatedTime = data.accumulated_time || 0;
            
            setIsRunning(newIsRunning);
            setStartTime(newStartTime);
            setAccumulatedTime(newAccumulatedTime);
            
            // Calculate current display time
            if (newIsRunning && newStartTime) {
              const currentTime = new Date().getTime();
              const start = new Date(newStartTime).getTime();
              setDisplayTime(newAccumulatedTime + (currentTime - start));
            } else {
              setDisplayTime(newAccumulatedTime);
            }
            
            stateRef.current.lastSyncTime = Date.now();
          }
        }
        
        if (mounted) {
          setIsSyncing(false);
          stateRef.current.syncInProgress = false;
        }
      } catch (e) {
        console.error("Unexpected error initializing timer:", e);
        if (mounted) {
          setIsSyncing(false);
          stateRef.current.syncInProgress = false;
          toast({
            title: "Unerwarteter Fehler",
            description: "Bei der Timer-Initialisierung ist ein Fehler aufgetreten.",
            variant: "destructive"
          });
        }
      }
    };
    
    // Initialize timer data
    initializeTimer();
    
    // Set up realtime subscription with optimized error handling
    const setupRealtimeSubscription = () => {
      try {
        channel = supabase
          .channel(`timer-${projectId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'project_timers',
              filter: `project_id=eq.${projectId}`
            },
            (payload) => {
              if (!mounted) return;
              
              try {
                const newData = payload.new as any;
                
                // Check if this is our own update to avoid processing it
                const currentUpdateId = stateRef.current.optimisticUpdateId;
                if (stateRef.current.pendingChanges && currentUpdateId > 0) {
                  stateRef.current.pendingChanges = false;
                  stateRef.current.optimisticUpdateId = 0;
                  // Immediately clear syncing state for our own updates
                  setIsSyncing(false);
                  stateRef.current.syncInProgress = false;
                  return;
                }
                
                console.info("Received realtime update:", newData);
                
                // Update local state with remote changes
                const newIsRunning = newData.is_running || false;
                const newStartTime = newData.start_time;
                const newAccumulatedTime = newData.accumulated_time || 0;
                
                setIsRunning(newIsRunning);
                setStartTime(newStartTime);
                setAccumulatedTime(newAccumulatedTime);
                
                // Calculate current display time based on new state
                if (newIsRunning && newStartTime) {
                  const currentTime = new Date().getTime();
                  const start = new Date(newStartTime).getTime();
                  setDisplayTime(newAccumulatedTime + (currentTime - start));
                } else {
                  setDisplayTime(newAccumulatedTime);
                }
                
                stateRef.current.lastSyncTime = Date.now();
                setIsSyncing(false);
                stateRef.current.syncInProgress = false;
              } catch (error) {
                console.error("Error processing realtime update:", error);
                setIsSyncing(false);
                stateRef.current.syncInProgress = false;
              }
            }
          )
          .subscribe((status) => {
            if (!mounted) return;
            
            console.info("Subscription status:", status);
            
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
              console.info("Erfolgreich mit Realtime verbunden");
            } else if (status === 'CHANNEL_ERROR') {
              setIsConnected(false);
              console.error("Nicht mit Echtzeit-Updates verbunden:", status);
              
              // Retry connection after shorter delay
              setTimeout(() => {
                if (mounted) {
                  setupRealtimeSubscription();
                }
              }, 2000);
            } else if (status === 'TIMED_OUT') {
              setIsConnected(false);
              console.error("Verbindung zur Echtzeit-Aktualisierung zeitüberschreitung:", status);
              
              // Retry connection after shorter delay
              setTimeout(() => {
                if (mounted) {
                  setupRealtimeSubscription();
                }
              }, 2000);
            }
          });
      } catch (err) {
        console.error("Error setting up realtime subscription:", err);
        setIsConnected(false);
        
        // Retry subscription setup with shorter delay
        setTimeout(() => {
          if (mounted) {
            setupRealtimeSubscription();
          }
        }, 2000);
      }
    };
    
    // Set up realtime subscription
    setupRealtimeSubscription();
    
    // Optimized periodic re-sync for safety
    const syncInterval = setInterval(() => {
      // If timer is running and last sync was more than 15 seconds ago, re-sync
      if (stateRef.current.isRunning && 
          Date.now() - stateRef.current.lastSyncTime > 15000 && 
          !stateRef.current.syncInProgress) {
        syncWithServer();
      }
      
      // If connection is lost, attempt to reconnect
      if (!isConnected && channel) {
        setupRealtimeSubscription();
      }
    }, 15000); // Reduced from 30s to 15s
    
    // Cleanup
    return () => {
      mounted = false;
      clearInterval(syncInterval);
      
      if (channel) {
        console.info("Cleaning up realtime subscription");
        supabase.removeChannel(channel);
      }
    };
  }, [projectId]);

  // Update the display time continuously while running with optimized interval
  useInterval(() => {
    if (stateRef.current.isRunning && stateRef.current.startTime) {
      const currentTime = new Date().getTime();
      const start = new Date(stateRef.current.startTime).getTime();
      setDisplayTime(stateRef.current.accumulatedTime + (currentTime - start));
    }
  }, stateRef.current.isRunning ? 100 : null); // Slightly increased from 50ms to 100ms for better performance

  // Optimized function to update server state
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
      }, 1000); // Reduced from 3000ms to 1000ms
      
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

  // Optimized toggle timer function
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

  // Optimized reset timer function
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

  // Manual synchronization function with faster execution
  const syncWithServer = async () => {
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
    isRunning,
    displayTime,
    toggleTimer,
    resetTimer,
    isSyncing,
    isConnected,
    syncWithServer
  };
};
