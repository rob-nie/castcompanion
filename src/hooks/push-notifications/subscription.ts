
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { arrayBufferToBase64 } from './utils';
import { registerServiceWorker } from './serviceWorker';
import type { PushSubscriptionRecord } from './types';

export const checkExistingSubscription = async (userId: string): Promise<boolean> => {
  if (!userId) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      // Check if subscription exists in database
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('endpoint', subscription.endpoint)
        .maybeSingle();

      if (!error && data) {
        return true;
      } else if (error) {
        console.error('Error checking subscription:', error);
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking existing subscription:', error);
    return false;
  }
};

export const subscribeToPushNotifications = async (userId: string): Promise<boolean> => {
  if (!userId) return false;

  try {
    // Register service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      toast.error('Service Worker konnte nicht registriert werden');
      return false;
    }

    await navigator.serviceWorker.ready;

    // Subscribe to push manager
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BEl62iUYgUivyIkv69yViEuiBIa40HI0DLb5PCfpFu7RhEgjOxrmUbMJlnKY'
    });

    // Save subscription to database
    const subscriptionData: PushSubscriptionRecord = {
      user_id: userId,
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
      return false;
    }

    toast.success('Push Notifications aktiviert');
    return true;

  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    toast.error('Fehler beim Aktivieren der Push Notifications');
    return false;
  }
};

export const unsubscribeFromPushNotifications = async (userId: string): Promise<boolean> => {
  if (!userId) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      
      // Remove from database
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('endpoint', subscription.endpoint);

      if (error) {
        console.error('Error removing subscription:', error);
      }
    }

    toast.success('Push Notifications deaktiviert');
    return true;

  } catch (error) {
    console.error('Error unsubscribing:', error);
    toast.error('Fehler beim Deaktivieren der Push Notifications');
    return false;
  }
};
