import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { de } from 'date-fns/locale';

// Mock Hooks und Typen, da sie in der gegebenen Umgebung fehlen.
// Ersetze diese durch deine tatsächlichen Implementierungen.
interface Tables<T extends string> {
  "projects": any; // Verwende den tatsächlichen Typ für dein Projekt-Objekt
}
const useIsMobile = () => false; // Dummy-Implementierung
const useMessages = (projectId: string) => ({
  messages: [
    {
      id: '1',
      sender_id: 'user1',
      sender_full_name: 'Max Mustermann',
      content: 'Hallo zusammen!',
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // Vor einer Stunde
    },
    {
      id: '2',
      sender_id: 'user2',
      sender_full_name: 'Erika Musterfrau',
      content: 'Hallo Max, wie gehts?',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Vor 30 Minuten
    },
    {
        id: '3',
        sender_id: 'user1',
        sender_full_name: 'Max Mustermann',
        content: 'Mir gehts gut, danke! Und dir?  Dieser Text ist etwas länger, um zu sehen, wie der Umbruch funktioniert. Er sollte in der Bubble bleiben.',
        created_at: new Date().toISOString(), // Jetzt
      },
  ],
  isLoading: false,
  error: null,
  sendMessage: async (message: string) => {
    console.log('Nachricht gesendet:', message);
    return true; // Simuliere erfolgreiches Senden
  },
});
const useProjectMembership = (projectId: string) => ({
  isProjectMember: true, // Dummy-Implementierung
});
const useAuth = () => ({
  user: { id: 'user1' }, // Dummy-Implementierung
});

interface MessengerTileProps {
  project: Tables<"projects">;
}

export const MessengerTile = ({ project }: MessengerTileProps) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const { messages, isLoading, error, sendMessage } = useMessages(project.id);
  const { isProjectMember } = useProjectMembership(project.id);
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isProjectMember) return;

    try {
      setIsSending(true);
      const sent = await sendMessage(newMessage);
      if (sent) {
        setNewMessage("");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Funktion zum Formatieren des Datums/Uhrzeit
  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const timeString = format(date, 'HH:mm');

    if (isToday(date)) {
      return timeString;
    } else if (isYesterday(date)) {
      return `Gestern, ${timeString}`;
    } else {
      return `${format(date, 'dd.MM.yyyy', { locale: de })}, ${timeString}`;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Debugginghelfer - temporär hinzufügen, um zu sehen ob die Komponente
      die richtige Höhe hat und wie das Layout sich verhält
      */}
      <div className="bg-red-100 dark:bg-red-900 text-xs p-1 text-center">
        Debug: Container-Höhe
      </div>

      {/* Scrollbarer Nachrichtenbereich */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#7A9992] dark:text-[#CCCCCC]">Nachrichten werden geladen...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500">Fehler: {error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#7A9992] dark:text-[#CCCCCC]">Noch keine Nachrichten.</p>
          </div>
        ) : (
          <div className="space-y-3 p-2">
            {messages.map((message, index) => {
              // Check if this message is the first from this sender in a sequence
              const isFirstInSequence = index === 0 ||
                messages[index - 1].sender_id !== message.sender_id;

              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${message.sender_id === user?.id ? 'items-end' : 'items-start'}`}
                >
                  {/* Benutzername nur für die erste Nachricht in einer Sequenz anzeigen */}
                  {message.sender_id !== user?.id && isFirstInSequence && (
                    <span className="text-xs text-[#7A9992] dark:text-[#CCCCCC] mb-1">
                      {message.sender_full_name || 'Unbekannt'}
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    {/* Timestamp for sent messages - on the left */}
                    {message.sender_id === user?.id && (
                      <span className="text-[10px] text-[#7A9992] dark:text-[#CCCCCC] self-center">
                        {formatMessageTime(message.created_at)}
                      </span>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`p-3 ${
                        message.sender_id === user?.id
                          ? 'bg-[#14A090] text-white rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[10px] rounded-br-0'
                          : 'bg-[#DAE5E2] dark:bg-[#5E6664] text-[#0A1915] dark:text-white rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-0'
                      }`}
                    >
                      <p className="text-sm break-words">
                        {message.content}
                      </p>
                    </div>

                    {/* Timestamp for received messages - on the right */}
                    {message.sender_id !== user?.id && (
                      <span className="text-[10px] text-[#7A9992] dark:text-[#CCCCCC] self-center">
                        {formatMessageTime(message.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Debug-Element um zu sehen, wie weit gescrollt werden kann */}
            <div className="bg-blue-100 dark:bg-blue-900 text-xs p-1 text-center">
              Ende der Nachrichten
            </div>
          </div>
        )}
      </div>

      {/* Eingabebereich - mit deutlicher visueller Trennung */}
      <div className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 mt-2">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nachricht eingeben..."
            className="w-full border-[#7A9992] dark:border-[#CCCCCC] rounded-[10px] resize-none h-[44px] min-h-[44px] py-2 px-4"
            style={{ display: 'flex', alignItems: 'center' }}
            maxLength={500}
            disabled={!isProjectMember || isSending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isProjectMember || isSending}
            className="bg-[#14A090] hover:bg-[#14A090]/80 h-[44px] w-[44px] min-w-[44px] rounded-[10px] px-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        {!isProjectMember && !isLoading && (
          <p className="text-[10px] text-[#7A9992] dark:text-[#CCCCCC] mt-2">
            Du musst Mitglied dieses Projekts sein, um Nachrichten senden zu können.
          </p>
        )}
      </div>
    </div>
  );
};
