
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useInterval } from "@/hooks/useInterval";

export const useTimer = (projectId: string) => {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [subscriptionReady, setSubscriptionReady] = useState(false);

  // Fetch initial timer state
  useEffect(() => {
    const fetchTimer = async () => {
      try {
        const { data, error } = await supabase
          .from("project_timers")
          .select("*")
          .eq("project_id", projectId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching timer:", error);
          return;
        }

        if (data) {
          setIsRunning(data.is_running);
          setStartTime(data.start_time);
          setAccumulatedTime(data.accumulated_time);
          
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
      } catch (e) {
        console.error("Unexpected error in fetchTimer:", e);
      }
    };

    fetchTimer();
  }, [projectId]);

  // Set up realtime subscription
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
          const newData = payload.new as any;
          
          // Update local state with remote changes
          setIsRunning(newData.is_running);
          setStartTime(newData.start_time);
          setAccumulatedTime(newData.accumulated_time);
          
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
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setSubscriptionReady(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  // Update the display time continuously while running
  useInterval(() => {
    if (isRunning && startTime) {
      const currentTime = new Date().getTime();
      const start = new Date(startTime).getTime();
      setDisplayTime(accumulatedTime + (currentTime - start));
    }
  }, isRunning ? 10 : null);

  const toggleTimer = async () => {
    if (!subscriptionReady) return; // Don't allow actions until subscription is ready
    
    setIsSyncing(true);
    const currentTime = new Date().toISOString();
    
    try {
      if (isRunning) {
        const elapsedTime = startTime 
          ? accumulatedTime + (new Date().getTime() - new Date(startTime).getTime())
          : accumulatedTime;

        await supabase
          .from("project_timers")
          .update({
            is_running: false,
            start_time: null,
            accumulated_time: elapsedTime,
            updated_at: currentTime
          })
          .eq("project_id", projectId);
      } else {
        await supabase
          .from("project_timers")
          .update({
            is_running: true,
            start_time: currentTime,
            updated_at: currentTime
          })
          .eq("project_id", projectId);
      }
    } catch (error) {
      console.error("Error toggling timer:", error);
      setIsSyncing(false); // Reset syncing state on error
    }
  };

  const resetTimer = async () => {
    if (!subscriptionReady) return; // Don't allow actions until subscription is ready
    
    setIsSyncing(true);
    const currentTime = new Date().toISOString();
    
    try {
      await supabase
        .from("project_timers")
        .update({
          is_running: false,
          start_time: null,
          accumulated_time: 0,
          updated_at: currentTime
        })
        .eq("project_id", projectId);
        
      // Don't update the local state immediately; wait for the realtime update
      // This ensures consistency across clients
    } catch (error) {
      console.error("Error resetting timer:", error);
      setIsSyncing(false); // Reset syncing state on error
    }
  };

  return {
    isRunning,
    displayTime,
    toggleTimer,
    resetTimer,
    isSyncing
  };
};
