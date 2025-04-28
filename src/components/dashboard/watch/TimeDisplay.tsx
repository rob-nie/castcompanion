
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface TimeDisplayProps {
  currentTime: Date;
}

export const TimeDisplay = ({ currentTime }: TimeDisplayProps) => {
  return (
    <div className="text-center text-white">
      <div className="font-inter font-normal text-[14px]">
        {format(currentTime, 'HH:mm')} Uhr
      </div>
      <div className="font-inter font-normal text-[10px]">
        {format(currentTime, 'EEE, d. MMMM yyyy', { locale: de })}
      </div>
    </div>
  );
};
