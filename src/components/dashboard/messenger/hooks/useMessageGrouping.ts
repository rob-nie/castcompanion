
import { differenceInDays } from "date-fns";

interface Message {
  id: string;
  content: string;
  project_id: string;
  sender_id: string;
  created_at: string;
  sender_full_name: string | null;
}

interface MessageGroup {
  message: Message;
  isFirstInSequence: boolean;
  showDateSeparator: boolean;
}

export const useMessageGrouping = (messages: Message[]) => {
  const groupedMessages: MessageGroup[] = messages.map((message, index) => {
    const isFirstInSequence = index === 0 || 
      messages[index - 1].sender_id !== message.sender_id;
    
    let showDateSeparator = false;
    if (index === 0) {
      showDateSeparator = true;
    } else {
      const currentDate = new Date(message.created_at);
      const previousDate = new Date(messages[index - 1].created_at);
      showDateSeparator = differenceInDays(currentDate, previousDate) !== 0;
    }
    
    return {
      message,
      isFirstInSequence,
      showDateSeparator
    };
  });

  return { groupedMessages };
};
