
import { Play, Pause, RotateCcw } from "lucide-react";
import { formatTime } from "./utils";

interface TimerControlsProps {
  isRunning: boolean;
  displayTime: number;
  onToggle: () => void;
  onReset: () => void;
}

export const TimerControls = ({ isRunning, displayTime, onToggle, onReset }: TimerControlsProps) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex-1 flex justify-end pr-6">
        <button
          onClick={onToggle}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white border border-white/50"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label={isRunning ? "Pause" : "Play"}
          type="button"
          role="button"
          tabIndex={0}
        >
          {isRunning ? (
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
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white border border-white/50"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label="Reset"
          type="button"
          role="button"
          tabIndex={0}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
