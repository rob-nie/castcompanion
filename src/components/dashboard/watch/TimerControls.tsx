
import { Play, Pause, RotateCcw } from "lucide-react";
import { formatTime } from "./utils";

interface TimerControlsProps {
  isRunning: boolean;
  displayTime: number;
  onToggle: (e?: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => void;
  onReset: (e?: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => void;
  isMobile?: boolean;
  isSyncing?: boolean;
}

export const TimerControls = ({ 
  isRunning, 
  displayTime, 
  onToggle, 
  onReset, 
  isMobile = false,
  isSyncing = false
}: TimerControlsProps) => {
  // Wenn im mobilen Layout und innerhalb der Tile, zeige nur die Zeit an
  if (isMobile) {
    return (
      <div
        className="font-inter font-bold text-[20px] text-white text-center"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatTime(displayTime)}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex-1 flex justify-end pr-6">
        <button
          onClick={onToggle}
          disabled={isSyncing}
          className={`w-10 h-10 flex items-center justify-center rounded-full ${
            isSyncing ? 'bg-white/10' : 'bg-white/20 active:bg-white/30'
          } transition-colors text-white border border-white/50`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label={isRunning ? "Pause" : "Play"}
          type="button"
          role="button"
          tabIndex={0}
        >
          {isSyncing ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
      </div>

      <div
        className="font-inter font-bold text-[20px] text-white w-[100px] text-center"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatTime(displayTime)}
      </div>

      <div className="flex-1 flex justify-start pl-6">
        <button
          onClick={onReset}
          disabled={isSyncing}
          className={`w-10 h-10 flex items-center justify-center rounded-full ${
            isSyncing ? 'bg-white/10' : 'bg-white/20 active:bg-white/30'
          } transition-colors text-white border border-white/50`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label="Reset"
          type="button"
          role="button"
          tabIndex={0}
        >
          {isSyncing ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
};
