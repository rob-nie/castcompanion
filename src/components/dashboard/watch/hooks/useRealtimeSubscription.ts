
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { TimerStateRef } from './useTimerState';

export const useRealtimeSubscription = (
  projectId: string,
  stateRef: React.MutableRefObject<TimerStateRef>,
  setIsRunning: (running: boolean) => void,
  setStartTime: (time: string | null) => void,
  setAccumulatedTime: (time: number) => void,
  setDisplayTime: (time: number) => void,
  setIsSyncing: (syncing: boolean) => void
) => {
  const [isConnected, setIsConnected] = useState(false);

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
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              setIsConnected(false);
              console.error("Verbindungsfehler:", status);
              
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
        
        setTimeout(() => {
          if (mounted) {
            setupRealtimeSubscription();
          }
        }, 2000);
      }
    };
    
    // Initialize timer data
    initializeTimer();
    
    // Set up realtime subscription
    setupRealtimeSubscription();
    
    // Cleanup
    return () => {
      mounted = false;
      
      if (channel) {
        console.info("Cleaning up realtime subscription");
        supabase.removeChannel(channel);
      }
    };
  }, [projectId, setIsRunning, setStartTime, setAccumulatedTime, setDisplayTime, setIsSyncing, stateRef]);

  return { isConnected };
};
