import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

interface WatchTileProps {
  project: Tables<"projects">;
}

export const WatchTile = ({ project }: WatchTileProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

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

    // Check dark mode
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === 'class' &&
          mutation.target === document.documentElement
        ) {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      clearInterval(timeInterval);
      supabase.removeChannel(channel);
      observer.disconnect();
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

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="h-[136px] max-w-[414px] p-6 rounded-[20px] overflow-hidden relative"
      style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #14A090, #CE9F7C)' 
          : 'linear-gradient(135deg, #14A090, #0A2550)',
        boxShadow: '0 5px 15px rgba(20, 160, 130, 0.5)'
      }}
    >
      <div className="text-white h-full flex flex-col items-center">
        <div className="font-inter font-bold text-[20px] mb-3 font-mono">
          {formatTime(displayTime)}
        </div>
        
        <div className="text-center mb-4">
          <div className="text-[14px] font-normal">
            {format(currentTime, 'HH:mm')} Uhr
          </div>
          <div className="text-[10px] font-normal">
            {format(currentTime, 'EEE, d. MMMM yyyy', { locale: de })}
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <Button
            onClick={toggleTimer}
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border border-white/50"
          >
            {isRunning ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start
              </>
            )}
          </Button>

          <Button
            onClick={() => {
              setDisplayTime(0);
              setAccumulatedTime(0);
              if (isRunning) {
                toggleTimer();
              }
            }}
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border border-white/50"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
