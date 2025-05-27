
import type { Tables } from "@/integrations/supabase/types";
import { MobileTimerControls } from "./watch/MobileTimerControls";
import { DesktopTimerWrapper } from "./watch/DesktopTimerWrapper";
import { useTimer } from "./watch/useTimer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDarkMode } from "./watch/hooks/useDarkMode";
import { useCurrentTime } from "./watch/hooks/useCurrentTime";

interface WatchTileProps {
  project: Tables<"projects">;
}

export const WatchTile = ({ project }: WatchTileProps) => {
  const currentTime = useCurrentTime();
  const isDarkMode = useDarkMode();
  const { isRunning, displayTime, toggleTimer, resetTimer, isSyncing, isConnected } = useTimer(project.id);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileTimerControls
        isRunning={isRunning}
        displayTime={displayTime}
        toggleTimer={toggleTimer}
        resetTimer={resetTimer}
        isSyncing={isSyncing}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <DesktopTimerWrapper
      isRunning={isRunning}
      displayTime={displayTime}
      toggleTimer={toggleTimer}
      resetTimer={resetTimer}
      isSyncing={isSyncing}
      currentTime={currentTime}
      isDarkMode={isDarkMode}
    />
  );
};
