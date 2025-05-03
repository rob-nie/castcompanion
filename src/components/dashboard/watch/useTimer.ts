import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useInterval } from "@/hooks/useInterval";

export const useTimer = (projectId: string) => {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [subscriptionReady, setSubscriptionReady] = useState(false);
  
  // Refs für bessere Synchronisation
  const lastSyncTime = useRef<number>(Date.now());
  const lastKnownState = useRef({
    isRunning: false,
    startTime: null as string | null,
    accumulatedTime: 0
  });

  // Fetch initial timer state
  useEffect(() => {
    const fetchTimer = async () => {
      try {
        setIsSyncing(true);
        const { data, error } = await supabase
          .from("project_timers")
          .select("*")
          .eq("project_id", projectId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching timer:", error);
          setIsSyncing(false);
          return;
        }

        if (data) {
          setIsRunning(data.is_running);
          setStartTime(data.start_time);
          setAccumulatedTime(data.accumulated_time);
          
          // Aktualisiere das letzte bekannte State
          lastKnownState.current = {
            isRunning: data.is_running,
            startTime: data.start_time,
            accumulatedTime: data.accumulated_time
          };
          
          // Aktualisiere die Synchronisationszeit
          lastSyncTime.current = Date.now();
          
          // Calculate current display time
          if (data.is_running && data.start_time) {
            const currentTime = new Date().getTime();
            const start = new Date(data.start_time).getTime();
            setDisplayTime(data.accumulated_time + (currentTime - start));
          } else {
            setDisplayTime(data.accumulated_time);
          }
        } else {
          try {
            await supabase
              .from("project_timers")
              .insert([{ project_id: projectId }]);
          } catch (insertError) {
            console.error("Error creating timer:", insertError);
          }
        }
        setIsSyncing(false);
      } catch (e) {
        console.error("Unexpected error in fetchTimer:", e);
        setIsSyncing(false);
      }
    };

    fetchTimer();
    
    // Periodische Neusynchronisierung, falls nötig
    const syncInterval = setInterval(() => {
      // Wenn die letzte Synchronisierung mehr als 30 Sekunden her ist und der Timer läuft
      if (Date.now() - lastSyncTime.current > 30000 && isRunning) {
        fetchTimer();
      }
    }, 30000);
    
    return () => clearInterval(syncInterval);
  }, [projectId]);

  // Set up realtime subscription mit verbesserten Error-Handling
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_timers',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          try {
            const newData = payload.new as any;
            
            // Update local state with remote changes
            setIsRunning(newData.is_running);
            setStartTime(newData.start_time);
            setAccumulatedTime(newData.accumulated_time);
            
            // Aktualisiere das letzte bekannte State
            lastKnownState.current = {
              isRunning: newData.is_running,
              startTime: newData.start_time,
              accumulatedTime: newData.accumulated_time
            };
            
            // Aktualisiere die Synchronisationszeit
            lastSyncTime.current = Date.now();
            
            // Calculate current display time based on new state
            if (newData.is_running && newData.start_time) {
              const currentTime = new Date().getTime();
              const start = new Date(newData.start_time).getTime();
              setDisplayTime(newData.accumulated_time + (currentTime - start));
            } else {
              setDisplayTime(newData.accumulated_time);
            }
            
            // When we receive a change from server, turn off syncing state
            setIsSyncing(false);
          } catch (error) {
            console.error("Error processing realtime update:", error);
            setIsSyncing(false);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setSubscriptionReady(true);
        } else if (status === 'CHANNEL_ERROR') {
          console.error("Channel subscription error");
          // Versuche nach Fehler erneut zu verbinden
          setTimeout(() => {
            setSubscriptionReady(false);
          }, 5000);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  // Update the display time continuously while running - höhere Frequenz für Flüssigkeit
  useInterval(() => {
    if (isRunning && startTime) {
      const currentTime = new Date().getTime();
      const start = new Date(startTime).getTime();
      setDisplayTime(accumulatedTime + (currentTime - start));
    }
  }, isRunning ? 10 : null); // Aktualisiert alle 10ms für flüssigere Anzeige

  // Funktion, um den Server-Zustand aus dem aktuellen lokalen Zustand zu aktualisieren
  const updateServerState = async (newState: {
    is_running?: boolean;
    start_time?: string | null;
    accumulated_time?: number;
  }) => {
    if (!subscriptionReady) return false;
    
    setIsSyncing(true);
    const currentTime = new Date().toISOString();
    
    try {
      const { error } = await supabase
        .from("project_timers")
        .update({
          ...newState,
          updated_at: currentTime
        })
        .eq("project_id", projectId);
        
      if (error) {
        console.error("Error updating timer:", error);
        setIsSyncing(false);
        return false;
      }
      
      // Behalt den syncing-Status bis zum Realtime-Update
      return true;
    } catch (error) {
      console.error("Unexpected error updating timer:", error);
      setIsSyncing(false);
      return false;
    }
  };

  const toggleTimer = async () => {
    if (!subscriptionReady || isSyncing) return;
    
    const currentTime = new Date();
    
    if (isRunning) {
      // Berechne die aktuelle verstrichene Zeit
      const elapsedTime = startTime 
        ? accumulatedTime + (currentTime.getTime() - new Date(startTime).getTime())
        : accumulatedTime;
      
      // Optimistische UI-Aktualisierung
      setIsRunning(false);
      setStartTime(null);
      setAccumulatedTime(elapsedTime);
      setDisplayTime(elapsedTime);
      
      // Server-Aktualisierung
      await updateServerState({
        is_running: false,
        start_time: null,
        accumulated_time: elapsedTime
      });
    } else {
      const newStartTime = currentTime.toISOString();
      
      // Optimistische UI-Aktualisierung
      setIsRunning(true);
      setStartTime(newStartTime);
      
      // Server-Aktualisierung
      await updateServerState({
        is_running: true,
        start_time: newStartTime
      });
    }
  };

  const resetTimer = async () => {
    if (!subscriptionReady || isSyncing) return;
    
    // Optimistische UI-Aktualisierung
    setIsRunning(false);
    setStartTime(null);
    setAccumulatedTime(0);
    setDisplayTime(0);
    
    // Server-Aktualisierung
    await updateServerState({
      is_running: false,
      start_time: null,
      accumulated_time: 0
    });
  };

  // Manuelle Synchronisationsfunktion für Benutzerinitiierten Sync
  const syncWithServer = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      const { data, error } = await supabase
        .from("project_timers")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();
        
      if (error) {
        console.error("Error syncing timer:", error);
        setIsSyncing(false);
        return;
      }
      
      if (data) {
        setIsRunning(data.is_running);
        setStartTime(data.start_time);
        setAccumulatedTime(data.accumulated_time);
        
        // Aktualisiere das letzte bekannte State
        lastKnownState.current = {
          isRunning: data.is_running,
          startTime: data.start_time,
          accumulatedTime: data.accumulated_time
        };
        
        // Aktualisiere die Synchronisationszeit
        lastSyncTime.current = Date.now();
        
        // Aktualisiere die Anzeige
        if (data.is_running && data.start_time) {
          const currentTime = new Date().getTime();
          const start = new Date(data.start_time).getTime();
          setDisplayTime(data.accumulated_time + (currentTime - start));
        } else {
          setDisplayTime(data.accumulated_time);
        }
      }
      
      setIsSyncing(false);
    } catch (error) {
      console.error("Unexpected error during sync:", error);
      setIsSyncing(false);
    }
  };

  return {
    isRunning,
    displayTime,
    toggleTimer,
    resetTimer,
    isSyncing,
    syncWithServer
  };
};