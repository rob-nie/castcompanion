
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface DateSeparatorProps {
  date: string;
}

export const DateSeparator = ({ date }: DateSeparatorProps) => {
  const formatDateHeader = (dateStr: string) => {
    const messageDate = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = messageDate.toDateString() === today.toDateString();
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();
    
    if (isToday) return "Heute";
    if (isYesterday) return "Gestern";
    return format(messageDate, "dd.MM.yyyy", { locale: de });
  };

  return (
    <div className="flex justify-center my-4">
      <div className="px-3 py-1 text-xs rounded-full bg-[#DAE5E2] dark:bg-[#5E6664] text-[#7A9992] dark:text-[#CCCCCC]">
        {formatDateHeader(date)}
      </div>
    </div>
  );
};
