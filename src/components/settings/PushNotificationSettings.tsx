
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Zap } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export const PushNotificationSettings = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    sendTestNotification
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
    console.log('Toggle button clicked', { isSubscribed, isLoading });
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const handleTestNotification = async () => {
    console.log('Test notification button clicked');
    await sendTestNotification();
  };

  const getButtonText = () => {
    if (isLoading) return "Lädt...";
    if (isSubscribed) return "Benachrichtigungen deaktivieren";
    if (permission === 'denied') return "Benachrichtigungen verweigert";
    return "Benachrichtigungen aktivieren";
  };

  const getStatusText = () => {
    if (permission === 'denied') return "Verweigert";
    if (isSubscribed) return "Aktiviert";
    if (permission === 'granted') return "Berechtigung erteilt";
    return "Inaktiv";
  };

  const isDisabled = isLoading || permission === 'denied';

  console.log('PushNotificationSettings render:', {
    isSubscribed,
    permission,
    isLoading,
    buttonText: getButtonText(),
    statusText: getStatusText()
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-[#0A1915] dark:text-white">Push-Benachrichtigungen</h3>
      
      <div className="space-y-3">
        <p className="text-sm text-[#7A9992] dark:text-[#CCCCCC]">
          Erhalten Sie Benachrichtigungen für neue Nachrichten in Ihren Projekten.
        </p>
        
        <div className="flex items-center gap-3 flex-wrap">
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
          
          <span className={`text-sm font-medium ${
            isSubscribed 
              ? "text-[#14A090]" 
              : permission === 'denied'
              ? "text-red-500"
              : "text-[#7A9992] dark:text-[#CCCCCC]"
          }`}>
            Status: {getStatusText()}
          </span>
          
          {isSubscribed && (
            <Button
              onClick={handleTestNotification}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-[#7A9992] text-[#7A9992] dark:border-[#CCCCCC] dark:text-[#CCCCCC] hover:bg-[#7A9992] hover:text-white dark:hover:bg-[#CCCCCC] dark:hover:text-[#0A1915]"
            >
              <Zap className="h-4 w-4 mr-2" />
              Test senden
            </Button>
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
        
        {permission === 'granted' && !isSubscribed && (
          <div className="p-3 rounded-[10px] bg-[#DAE5E2] dark:bg-[#5E6664]">
            <p className="text-sm text-[#0A1915] dark:text-white">
              Browser-Berechtigung erteilt. Klicken Sie auf "Benachrichtigungen aktivieren" um die Funktion zu aktivieren.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
