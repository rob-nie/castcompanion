
import { format, isToday, isYesterday } from "date-fns";
import { de } from "date-fns/locale";

export const formatMessageTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const timeString = format(date, 'HH:mm');
  
  if (isToday(date)) {
    return `Heute, ${timeString}`;
  } else if (isYesterday(date)) {
    return `Gestern, ${timeString}`;
  } else {
    return `${format(date, 'dd.MM.yyyy', { locale: de })}, ${timeString}`;
  }
};
