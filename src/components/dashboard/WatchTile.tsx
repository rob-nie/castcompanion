
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Play, Pause, Timer } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface WatchTileProps {
  project: Tables<"projects">;
}

export const WatchTile = ({ project }: WatchTileProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    // Initial fetch of timer state
    const fetchTimer = async () => {
      const { data, error } = await supabase
        .from("project_timers")
        .select("*")
        .eq("project_id", project.id)
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
        // Create timer if it doesn't exist
        await supabase
          .from("project_timers")
          .insert([{ project_id: project.id }]);
      }
    };

    fetchTimer();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_timers',
          filter: `project_id=eq.${project.id}`
        },
        (payload) => {
          const newData = payload.new as Tables<"project_timers">;
          setIsRunning(newData.is_running);
          setStartTime(newData.start_time);
          setAccumulatedTime(newData.accumulated_time);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [project.id]);

  // Update display time
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
      // Stop timer
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
        .eq("project_id", project.id);
    } else {
      // Start timer
      await supabase
        .from("project_timers")
        .update({
          is_running: true,
          start_time: currentTime,
          updated_at: currentTime
        })
        .eq("project_id", project.id);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="h-64 p-6 rounded-[20px] overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #14A090, #0A2550)',
        boxShadow: '0 5px 15px rgba(20, 160, 130, 0.5)'
      }}
    >
      <div className="text-white h-full flex flex-col items-center justify-center">
        <Timer className="w-8 h-8 mb-4" />
        <div className="text-4xl font-medium mb-6 font-mono">
          {formatTime(displayTime)}
        </div>
        <Button
          onClick={toggleTimer}
          size="lg"
          className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50"
        >
          {isRunning ? (
            <>
              <Pause className="mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="mr-2" />
              Start
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
