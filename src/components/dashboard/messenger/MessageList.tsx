
import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import type { Message } from "@/hooks/useMessenger";

interface MessageListProps {
  messages: Message[];
  currentUserId: string | undefined;
  isProjectMember: boolean | null;
}

export const MessageList = ({ messages, currentUserId, isProjectMember }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isProjectMember === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[#7A9992] dark:text-[#CCCCCC] animate-pulse">Laden...</div>
      </div>
    );
  }

  if (isProjectMember === false) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[#7A9992] dark:text-[#CCCCCC]">
          Du hast keinen Zugriff auf diesen Chat
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[#7A9992] dark:text-[#CCCCCC]">
          Noch keine Nachrichten. Starte die Unterhaltung!
        </div>
      </div>
    );
  }

  // Group messages by sender and date
  const groupedMessages = messages.reduce<{
    [key: string]: {
      senderId: string;
      senderName: string;
      messages: Message[];
    };
  }>((groups, message) => {
    // Group by sender and within 2 minutes (120000 ms)
    const lastGroup = Object.values(groups).pop();
    const sameGroup = lastGroup && 
                    lastGroup.senderId === message.sender_id &&
                    (new Date(message.created_at).getTime() - 
                     new Date(lastGroup.messages[lastGroup.messages.length - 1].created_at).getTime() < 120000);
    
    if (sameGroup && lastGroup) {
      lastGroup.messages.push(message);
      return groups;
    } else {
      const groupKey = `${message.sender_id}-${message.created_at}`;
      groups[groupKey] = {
        senderId: message.sender_id,
        senderName: message.sender_name || "Unknown User",
        messages: [message]
      };
      return groups;
    }
  }, {});

  return (
    <div className="flex-1 overflow-y-auto py-2 space-y-4 min-h-0">
      {Object.values(groupedMessages).map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-1">
          {/* Only show sender name for received messages */}
          {group.senderId !== currentUserId && (
            <div className="text-xs text-[#7A9992] dark:text-[#CCCCCC] ml-2">
              {group.senderName}
            </div>
          )}
          
          <div className="space-y-1">
            {group.messages.map((message, msgIndex) => (
              <MessageBubble 
                key={message.id} 
                message={message}
                isCurrentUser={message.sender_id === currentUserId}
                isLastInGroup={msgIndex === group.messages.length - 1}
              />
            ))}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
