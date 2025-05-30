
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { checkPushNotificationSupport } from './utils';
import { checkExistingSubscription } from './subscription';

export const usePushNotificationState = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasBrowserSubscription, setHasBrowserSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Check if push notifications are supported and current subscription status
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
        
        try {
          const registration = await navigator.serviceWorker.ready;
          const browserSubscription = await registration.pushManager.getSubscription();
          const hasBrowserSub = !!browserSubscription;
          setHasBrowserSubscription(hasBrowserSub);
          
          console.log('Browser subscription status:', hasBrowserSub);
          
          const dbSubscribed = await checkExistingSubscription(user.id);
          setIsSubscribed(dbSubscribed);
          
          console.log('Database subscription status:', dbSubscribed);
          
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

  return {
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
  };
};
