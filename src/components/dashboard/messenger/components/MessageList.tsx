import { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { DateSeparator } from "./DateSeparator";
import { EmptyStates } from "./EmptyStates";
import { useMessageGrouping } from "../hooks/useMessageGrouping";

interface Message {
  id: string;
  content: string;
  project_id: string;
  sender_id: string;
  created_at: string;
  sender_full_name: string | null;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentUserId: string | undefined;
  lastSentMessageId?: string;
}

export const MessageList = ({
  messages,
  isLoading,
  error,
  currentUserId,
  lastSentMessageId
}: MessageListProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const initialScrollDone = useRef(false); // Ref, um den initialen Scroll zu verfolgen
  const { groupedMessages } = useMessageGrouping(messages);

  // Regel 3: App-Start - Scrolle beim ersten Laden zum Ende (nur einmal)
  useEffect(() => {
    const container = scrollContainerRef.current;
    // Nur scrollen, wenn geladen, Nachrichten da, Container existiert UND noch nicht initial gescrollt wurde
    if (!isLoading && messages.length > 0 && container && !initialScrollDone.current) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'auto' // 'auto' für einen sofortigen Sprung beim Start
      });
      initialScrollDone.current = true; // Markiere, dass der initiale Scroll erfolgt ist
    }
    // Wenn keine Nachrichten geladen werden (z.B. neuer Chat), setze das Flag zurück,
    // damit beim nächsten Laden gescrollt wird.
    if (!isLoading && messages.length === 0) {
        initialScrollDone.current = false;
    }

  }, [isLoading, messages.length]); // Abhängig von Ladezustand und Nachrichtenlänge

  // Regel 1 & 2: Autoscroll bei neuen Nachrichten
  useEffect(() => {
    const container = scrollContainerRef.current;
    // Wenn kein Container da ist oder keine Nachrichten, nichts tun.
    if (!container || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const isOwnMessage = lastMessage.sender_id === currentUserId;

    // Regel 1: Eigene Nachrichten - IMMER scrollen, wenn es die letzte gesendete ist
    if (isOwnMessage && lastSentMessageId === lastMessage.id) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
      return; // Wichtig: return, um nicht auch Regel 2 zu prüfen
    }

    // Regel 2: Fremde Nachrichten - nur scrollen wenn am Ende (innerhalb 100px)
    // Dieser Teil sollte nur laufen, wenn die letzte Nachricht NICHT die eigene ist
    // oder eine eigene, die nicht die 'lastSentMessageId' ist (weniger wahrscheinlich, aber sicher ist sicher)
    if (!isOwnMessage) {
      // Prüfe, ob der User *vor* dem Hinzufügen der neuen Nachricht am Ende war.
      // Hinweis: Diese Logik kann knifflig sein, da sie läuft, *nachdem* die Nachricht hinzugefügt wurde.
      // Die 100px Toleranz hilft hier.
      const isAtBottom = (container.scrollTop + container.clientHeight) >=
                         (container.scrollHeight - container.lastElementChild!.scrollHeight - 100);

      if (isAtBottom) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
    // Wichtig: Dieser Effekt MUSS laufen, wenn sich 'messages' ändert.
    // Die Logik *im* Effekt entscheidet dann, ob gescrollt wird.
  }, [messages, currentUserId, lastSentMessageId]); // Abhängig von Nachrichten, User-ID und letzter gesendeter ID

  return (
    <div className="relative h-full flex flex-col">
      {/* Der Scroll-Container wird jetzt IMMER gerendert */}
      <div
        ref={scrollContainerRef}
        className="space-y-3 overflow-y-auto h-full hide-scrollbar flex-1 p-4" // Padding hinzugefügt für Abstand
      >
        {/* Lade-/Fehler-/Leerzustand INNEN anzeigen */}
        {(isLoading && messages.length === 0) || error || messages.length === 0 ? (
          <EmptyStates
            isLoading={isLoading && messages.length === 0} // Zeige Loading nur, wenn WIRKLICH noch nichts da ist
            error={error}
            hasMessages={messages.length > 0}
          />
        ) : (
          /* Nachrichten nur rendern, wenn vorhanden */
          groupedMessages.map(({ message, isFirstInSequence, showDateSeparator }) => {
            const isSentByMe = message.sender_id === currentUserId;

            return (
              <div key={message.id}>
                {showDateSeparator && (
                  <DateSeparator date={message.created_at} />
                )}

                <MessageBubble
                  message={message}
                  isCurrentUser={isSentByMe}
                  isFirstInSequence={isFirstInSequence}
                  showTimestamp={true}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};