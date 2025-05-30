
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
    return null;
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
    <div className="flex items-center gap-2">
      <Button
        onClick={handleToggle}
        disabled={isDisabled}
        variant={isSubscribed ? "outline" : "default"}
        size="sm"
        className="text-xs"
      >
        {isSubscribed ? (
          <BellOff className="h-3 w-3 mr-1" />
        ) : (
          <Bell className="h-3 w-3 mr-1" />
        )}
        {getButtonText()}
      </Button>
      
      {permission === 'denied' && (
        <span className="text-xs text-[#7A9992] dark:text-[#CCCCCC]">
          Benachrichtigungen sind in den Browser-Einstellungen deaktiviert
        </span>
      )}
    </div>
  );
};
