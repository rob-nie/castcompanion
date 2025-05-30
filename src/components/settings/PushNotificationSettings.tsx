
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export const PushNotificationSettings = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[#0A1915] dark:text-white">Push-Benachrichtigungen</h3>
        <p className="text-sm text-[#7A9992] dark:text-[#CCCCCC]">
          Push-Benachrichtigungen werden von diesem Browser nicht unterstützt.
        </p>
      </div>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Lädt...";
    if (isSubscribed) return "Benachrichtigungen deaktivieren";
    if (permission === 'denied') return "Benachrichtigungen verweigert";
    return "Benachrichtigungen aktivieren";
  };

  const isDisabled = isLoading || permission === 'denied';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-[#0A1915] dark:text-white">Push-Benachrichtigungen</h3>
      
      <div className="space-y-3">
        <p className="text-sm text-[#7A9992] dark:text-[#CCCCCC]">
          Erhalten Sie Benachrichtigungen für neue Nachrichten in Ihren Projekten.
        </p>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={handleToggle}
            disabled={isDisabled}
            variant={isSubscribed ? "outline" : "default"}
            className={
              isSubscribed 
                ? "border-[#7A9992] text-[#7A9992] dark:border-[#CCCCCC] dark:text-[#CCCCCC]"
                : "bg-[#14A090] hover:bg-[#14A090]/90 text-white"
            }
          >
            {isSubscribed ? (
              <BellOff className="h-4 w-4 mr-2" />
            ) : (
              <Bell className="h-4 w-4 mr-2" />
            )}
            {getButtonText()}
          </Button>
          
          {isSubscribed && (
            <span className="text-sm text-[#14A090] font-medium">
              Aktiviert
            </span>
          )}
        </div>
        
        {permission === 'denied' && (
          <div className="p-3 rounded-[10px] bg-[#DAE5E2] dark:bg-[#5E6664]">
            <p className="text-sm text-[#0A1915] dark:text-white">
              Benachrichtigungen sind in den Browser-Einstellungen deaktiviert. 
              Bitte aktivieren Sie diese in Ihren Browser-Einstellungen und laden Sie die Seite neu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
