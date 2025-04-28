
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useTimer = (projectId: string) => {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    const fetchTimer = async () => {
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
      } else {
        await supabase
          .from("project_timers")
          .insert([{ project_id: projectId }]);
      }
    };

    fetchTimer();

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
          setIsRunning(newData.is_running);
          setStartTime(newData.start_time);
          setAccumulatedTime(newData.accumulated_time);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  useEffect(() => {
    if (!isRunning) {
      setDisplayTime(accumulatedTime);
      return;
    }

    const interval = setInterval(() => {
      if (startTime) {
        const currentTime = new Date().getTime();
        const start = new Date(startTime).getTime();
        setDisplayTime(accumulatedTime + (currentTime - start));
      }
    }, 10);

    return () => clearInterval(interval);
  }, [isRunning, startTime, accumulatedTime]);

  const toggleTimer = async () => {
    const currentTime = new Date().toISOString();
    
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
  };

  const resetTimer = async () => {
    const currentTime = new Date().toISOString();
    
    await supabase
      .from("project_timers")
      .update({
        is_running: false,
        start_time: null,
        accumulated_time: 0,
        updated_at: currentTime
      })
      .eq("project_id", projectId);
      
    setDisplayTime(0);
    setAccumulatedTime(0);
    setStartTime(null);
    setIsRunning(false);
  };

  return {
    isRunning,
    displayTime,
    toggleTimer,
    resetTimer
  };
};
