
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
    <div className="flex items-center gap-8">
      <button
        onClick={onToggle}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white border border-white/50"
      >
        {isRunning ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </button>

      <div className="font-inter font-bold text-[20px] text-white">
        {formatTime(displayTime)}
      </div>

      <button
        onClick={onReset}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white border border-white/50"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
};
