
import { requestNotificationPermission } from './permissions';
import { usePushNotificationState } from './state';
import { usePushNotificationOperations } from './operations';

export const usePushNotifications = () => {
  const {
    isSupported,
    isSubscribed,
    hasBrowserSubscription,
    isLoading,
    permission,
    user,
    setIsSubscribed,
    setHasBrowserSubscription,
    setIsLoading,
    setPermission
  } = usePushNotificationState();

  const {
    subscribe,
    unsubscribe,
    sendTestNotification
  } = usePushNotificationOperations({
    user,
    isSupported,
    isSubscribed,
    hasBrowserSubscription,
    isLoading,
    setIsSubscribed,
    setHasBrowserSubscription,
    setIsLoading,
    setPermission
  });

  // Determine the effective subscription status for UI
  const effectiveIsSubscribed = isSubscribed || hasBrowserSubscription;

  console.log('Hook state:', {
    isSupported,
    isSubscribed,
    hasBrowserSubscription,
    effectiveIsSubscribed,
    permission,
    isLoading
  });

  return {
    isSupported,
    isSubscribed: effectiveIsSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    requestPermission: requestNotificationPermission
  };
};
