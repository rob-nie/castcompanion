
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
  const [hasBrowserSubscription, setHasBrowserSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const supported = checkPushNotificationSupport();
      setIsSupported(supported);
      setPermission(Notification.permission);
      
      console.log('Push notification support check:', {
        supported,
        permission: Notification.permission
      });
      
      if (supported && user) {
        console.log('Checking existing subscription for user:', user.id);
        
        // Check browser subscription
        try {
          const registration = await navigator.serviceWorker.ready;
          const browserSubscription = await registration.pushManager.getSubscription();
          const hasBrowserSub = !!browserSubscription;
          setHasBrowserSubscription(hasBrowserSub);
          
          console.log('Browser subscription status:', hasBrowserSub);
          
          // Check database subscription
          const dbSubscribed = await checkExistingSubscription(user.id);
          setIsSubscribed(dbSubscribed);
          
          console.log('Database subscription status:', dbSubscribed);
          
          // If we have browser subscription but no database entry, consider it subscribed
          if (hasBrowserSub && !dbSubscribed) {
            console.log('Browser subscribed but not in database - considering as subscribed');
            setIsSubscribed(true);
          }
        } catch (error) {
          console.error('Error checking subscription status:', error);
        }
      }
    };

    checkSupport();
  }, [user]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user || !isSupported) {
      console.log('Subscribe aborted: user or support missing', { user: !!user, isSupported });
      return false;
    }

    setIsLoading(true);
    console.log('Starting subscription process...');

    try {
      // Request permission first
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

      // Update permission state immediately
      setPermission('granted');
      console.log('Permission granted, proceeding with subscription...');

      // Check if we already have a browser subscription
      try {
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          console.log('Existing browser subscription found');
          setHasBrowserSubscription(true);
        } else {
          console.log('No existing browser subscription, creating new one...');
          // Create new subscription through our subscription function
        }
      } catch (error) {
        console.error('Error checking existing browser subscription:', error);
      }

      // Attempt to subscribe (this handles both browser and database)
      console.log('Calling subscribeToPushNotifications...');
      const success = await subscribeToPushNotifications(user.id);
      console.log('subscribeToPushNotifications result:', success);
      
      if (success) {
        setIsSubscribed(true);
        setHasBrowserSubscription(true);
        console.log('Subscription successful - updating UI state');
      } else {
        console.log('Subscription failed');
        // Even if database save failed, check if browser subscription exists
        try {
          const registration = await navigator.serviceWorker.ready;
          const browserSub = await registration.pushManager.getSubscription();
          if (browserSub) {
            console.log('Browser subscription exists despite database failure');
            setHasBrowserSubscription(true);
            setIsSubscribed(true); // Consider it subscribed if browser has it
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
  }, [user, isSupported]);

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
  }, [user]);

  // Send test notification
  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    if (!user || (!isSubscribed && !hasBrowserSubscription)) {
      console.log('Test notification aborted: not subscribed');
      return false;
    }

    setIsLoading(true);
    console.log('Sending test notification...');

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
  }, [user, isSubscribed, hasBrowserSubscription]);

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
