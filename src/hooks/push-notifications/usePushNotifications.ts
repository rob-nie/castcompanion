
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';
import { checkPushNotificationSupport } from './utils';
import { requestNotificationPermission } from './permissions';
import { 
  checkExistingSubscription, 
  subscribeToPushNotifications, 
  unsubscribeFromPushNotifications 
} from './subscription';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const supported = checkPushNotificationSupport();
      setIsSupported(supported);
      setPermission(Notification.permission);
      
      if (supported && user) {
        const subscribed = await checkExistingSubscription(user.id);
        setIsSubscribed(subscribed);
      }
    };

    checkSupport();
  }, [user]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user || !isSupported) return false;

    setIsLoading(true);

    try {
      // Request permission first
      const hasPermission = permission === 'granted' || await requestNotificationPermission();
      if (!hasPermission) {
        setIsLoading(false);
        return false;
      }

      const success = await subscribeToPushNotifications(user.id);
      if (success) {
        setIsSubscribed(true);
        setPermission('granted');
      }
      
      setIsLoading(false);
      return success;

    } catch (error) {
      console.error('Error in subscribe:', error);
      setIsLoading(false);
      return false;
    }
  }, [user, isSupported, permission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);

    try {
      const success = await unsubscribeFromPushNotifications(user.id);
      if (success) {
        setIsSubscribed(false);
      }
      
      setIsLoading(false);
      return success;

    } catch (error) {
      console.error('Error in unsubscribe:', error);
      setIsLoading(false);
      return false;
    }
  }, [user]);

  // Send test notification
  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    if (!user || !isSubscribed) return false;

    setIsLoading(true);

    try {
      // Show test notification directly using the Notification API
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
  }, [user, isSubscribed]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    requestPermission: requestNotificationPermission
  };
};
