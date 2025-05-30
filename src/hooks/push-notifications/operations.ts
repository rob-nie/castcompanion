
import { useCallback } from 'react';
import { toast } from 'sonner';
import { requestNotificationPermission } from './permissions';
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from './subscription';

interface OperationsProps {
  user: any;
  isSupported: boolean;
  isSubscribed: boolean;
  hasBrowserSubscription: boolean;
  isLoading: boolean;
  setIsSubscribed: (value: boolean) => void;
  setHasBrowserSubscription: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  setPermission: (value: NotificationPermission) => void;
}

export const usePushNotificationOperations = ({
  user,
  isSupported,
  isSubscribed,
  hasBrowserSubscription,
  isLoading,
  setIsSubscribed,
  setHasBrowserSubscription,
  setIsLoading,
  setPermission
}: OperationsProps) => {

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user || !isSupported) {
      console.log('Subscribe aborted: user or support missing', { user: !!user, isSupported });
      return false;
    }

    setIsLoading(true);
    console.log('Starting subscription process...');

    try {
      const currentPermission = Notification.permission;
      console.log('Current permission:', currentPermission);
      
      let hasPermission = currentPermission === 'granted';
      
      if (!hasPermission) {
        console.log('Requesting notification permission...');
        hasPermission = await requestNotificationPermission();
        console.log('Permission request result:', hasPermission);
      }
      
      if (!hasPermission) {
        console.log('Permission denied, aborting subscription');
        setPermission(Notification.permission);
        setIsLoading(false);
        return false;
      }

      setPermission('granted');
      console.log('Permission granted, proceeding with subscription...');

      try {
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          console.log('Existing browser subscription found');
          setHasBrowserSubscription(true);
        } else {
          console.log('No existing browser subscription, creating new one...');
        }
      } catch (error) {
        console.error('Error checking existing browser subscription:', error);
      }

      console.log('Calling subscribeToPushNotifications...');
      const success = await subscribeToPushNotifications(user.id);
      console.log('subscribeToPushNotifications result:', success);
      
      if (success) {
        setIsSubscribed(true);
        setHasBrowserSubscription(true);
        console.log('Subscription successful - updating UI state');
      } else {
        console.log('Subscription failed');
        try {
          const registration = await navigator.serviceWorker.ready;
          const browserSub = await registration.pushManager.getSubscription();
          if (browserSub) {
            console.log('Browser subscription exists despite database failure');
            setHasBrowserSubscription(true);
            setIsSubscribed(true);
            toast.success('Push Notifications aktiviert (Browser)');
          }
        } catch (error) {
          console.error('Error checking browser subscription after failure:', error);
        }
      }
      
      setIsLoading(false);
      return success;

    } catch (error) {
      console.error('Error in subscribe function:', error);
      setIsLoading(false);
      return false;
    }
  }, [user, isSupported, setIsLoading, setPermission, setIsSubscribed, setHasBrowserSubscription]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    console.log('Starting unsubscribe process...');

    try {
      const success = await unsubscribeFromPushNotifications(user.id);
      console.log('Unsubscribe result:', success);
      
      if (success) {
        setIsSubscribed(false);
        setHasBrowserSubscription(false);
      }
      
      setIsLoading(false);
      return success;

    } catch (error) {
      console.error('Error in unsubscribe:', error);
      setIsLoading(false);
      return false;
    }
  }, [user, setIsLoading, setIsSubscribed, setHasBrowserSubscription]);

  // Send test notification
  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    if (!user || (!isSubscribed && !hasBrowserSubscription)) {
      console.log('Test notification aborted: not subscribed');
      return false;
    }

    setIsLoading(true);
    console.log('Sending test notification...');

    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Test-Benachrichtigung', {
          body: 'Dies ist eine Test-Push-Benachrichtigung von Cast Companion.',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'test-notification'
        });
        
        toast.success('Test-Benachrichtigung gesendet');
        setIsLoading(false);
        return true;
      } else {
        console.log('Notification API not available or permission not granted');
        toast.error('Benachrichtigungen sind nicht verfügbar');
        setIsLoading(false);
        return false;
      }

    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Fehler beim Senden der Test-Benachrichtigung');
      setIsLoading(false);
      return false;
    }
  }, [user, isSubscribed, hasBrowserSubscription, setIsLoading]);

  return {
    subscribe,
    unsubscribe,
    sendTestNotification
  };
};
