
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 
                       'PushManager' in window && 
                       'Notification' in window;
      setIsSupported(supported);
      setPermission(Notification.permission);
      
      if (supported) {
        checkExistingSubscription();
      }
    };

    checkSupport();
  }, [user]);

  // Register service worker
  const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  };

  // Check if user already has a subscription
  const checkExistingSubscription = async () => {
    if (!user) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Check if subscription exists in database
        const { data, error } = await supabase
          .from('push_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint)
          .maybeSingle();

        if (!error && data) {
          setIsSubscribed(true);
        } else if (error) {
          console.error('Error checking subscription:', error);
        }
      }
    } catch (error) {
      console.error('Error checking existing subscription:', error);
    }
  };

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Push Notifications werden von diesem Browser nicht unterstützt');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Benachrichtigungen aktiviert');
        return true;
      } else {
        toast.error('Benachrichtigungen wurden verweigert');
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Fehler beim Anfordern der Berechtigung');
      return false;
    }
  };

  // Subscribe to push notifications
  const subscribe = async (): Promise<boolean> => {
    if (!user || !isSupported) return false;

    setIsLoading(true);

    try {
      // Request permission first
      const hasPermission = permission === 'granted' || await requestPermission();
      if (!hasPermission) {
        setIsLoading(false);
        return false;
      }

      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) {
        toast.error('Service Worker konnte nicht registriert werden');
        setIsLoading(false);
        return false;
      }

      await navigator.serviceWorker.ready;

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BEl62iUYgUivyIkv69yViEuiBIa40HI0DLb5PCfpFu7RhEgjOxrmUbMJlnKY' // You'll need to generate this
      });

      // Save subscription to database
      const subscriptionData = {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh_key: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth_key: arrayBufferToBase64(subscription.getKey('auth')!)
      };

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'user_id,endpoint'
        });

      if (error) {
        console.error('Error saving subscription:', error);
        toast.error('Fehler beim Speichern der Subscription');
        setIsLoading(false);
        return false;
      }

      setIsSubscribed(true);
      toast.success('Push Notifications aktiviert');
      setIsLoading(false);
      return true;

    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Fehler beim Aktivieren der Push Notifications');
      setIsLoading(false);
      return false;
    }
  };

  // Unsubscribe from push notifications
  const unsubscribe = async (): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from database
        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint);

        if (error) {
          console.error('Error removing subscription:', error);
        }
      }

      setIsSubscribed(false);
      toast.success('Push Notifications deaktiviert');
      setIsLoading(false);
      return true;

    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Fehler beim Deaktivieren der Push Notifications');
      setIsLoading(false);
      return false;
    }
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    requestPermission
  };
};
