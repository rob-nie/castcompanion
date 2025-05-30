import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { arrayBufferToBase64 } from './utils';
import { registerServiceWorker } from './serviceWorker';
import type { PushSubscriptionRecord } from './types';

export const checkExistingSubscription = async (userId: string): Promise<boolean> => {
  if (!userId) {
    console.log('checkExistingSubscription: No userId provided');
    return false;
  }

  try {
    console.log('Checking existing subscription for user:', userId);
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    console.log('Browser subscription check:', !!subscription);
    
    if (subscription) {
      // Check if subscription exists in database
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('endpoint', subscription.endpoint)
        .maybeSingle();

      console.log('Database subscription check:', { data: !!data, error });

      if (!error && data) {
        console.log('Found existing subscription in database');
        return true;
      } else if (error) {
        console.error('Error checking subscription in database:', error);
      } else {
        console.log('No subscription found in database');
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking existing subscription:', error);
    return false;
  }
};

export const subscribeToPushNotifications = async (userId: string): Promise<boolean> => {
  if (!userId) {
    console.log('subscribeToPushNotifications: No userId provided');
    return false;
  }

  console.log('Starting subscribeToPushNotifications for user:', userId);

  try {
    // Register service worker
    console.log('Registering service worker...');
    const registration = await registerServiceWorker();
    if (!registration) {
      console.error('Service Worker registration failed');
      toast.error('Service Worker Registrierung fehlgeschlagen');
      return false;
    }
    console.log('Service Worker registered successfully');

    await navigator.serviceWorker.ready;
    console.log('Service Worker ready');

    // Check if we already have a subscription
    let subscription = await registration.pushManager.getSubscription();
    console.log('Existing subscription check:', !!subscription);

    if (!subscription) {
      console.log('Creating new push subscription...');
      // Use a valid VAPID key - this is a properly formatted test key
      const vapidKey = 'BCVxar7pi_5_b6_uFX6ZnPH4SfCStfXs9hdcbHWw0Oedxj6Ndnw-5vGOQUq68YOaLh3gWqGrqVlJxgVhpNBUFPk';
      
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey
        });
        console.log('New subscription created successfully');
      } catch (subscribeError) {
        console.error('Error creating subscription:', subscribeError);
        if (subscribeError instanceof Error && subscribeError.name === 'InvalidAccessError') {
          toast.error('Ungültiger VAPID-Schlüssel. Bitte kontaktieren Sie den Administrator.');
        } else {
          toast.error('Fehler beim Erstellen der Subscription');
        }
        return false;
      }
    } else {
      console.log('Using existing subscription');
    }

    // Save subscription to database
    console.log('Saving subscription to database...');
    
    const p256dhKey = subscription.getKey('p256dh');
    const authKey = subscription.getKey('auth');
    
    if (!p256dhKey || !authKey) {
      console.error('Failed to get subscription keys');
      toast.error('Fehler beim Abrufen der Subscription-Schlüssel');
      return false;
    }

    const subscriptionData: PushSubscriptionRecord = {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh_key: arrayBufferToBase64(p256dhKey),
      auth_key: arrayBufferToBase64(authKey)
    };

    console.log('Subscription data prepared:', { 
      endpoint: subscription.endpoint, 
      user_id: userId 
    });

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id,endpoint'
      });

    if (error) {
      console.error('Error saving subscription to database:', error);
      toast.error('Fehler beim Speichern in der Datenbank');
      return false;
    }

    console.log('Subscription saved to database successfully');
    toast.success('Push Notifications erfolgreich aktiviert');
    return true;

  } catch (error) {
    console.error('Error in subscribeToPushNotifications:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        toast.error('Push Notifications wurden vom Benutzer verweigert');
      } else if (error.name === 'NotSupportedError') {
        toast.error('Push Notifications werden nicht unterstützt');
      } else if (error.name === 'InvalidAccessError') {
        toast.error('Ungültiger VAPID-Schlüssel. Bitte kontaktieren Sie den Administrator.');
      } else {
        toast.error(`Fehler beim Aktivieren: ${error.message}`);
      }
    } else {
      toast.error('Unbekannter Fehler beim Aktivieren der Push Notifications');
    }
    
    return false;
  }
};

export const unsubscribeFromPushNotifications = async (userId: string): Promise<boolean> => {
  if (!userId) {
    console.log('unsubscribeFromPushNotifications: No userId provided');
    return false;
  }

  console.log('Starting unsubscribeFromPushNotifications for user:', userId);

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    console.log('Current subscription for unsubscribe:', !!subscription);

    if (subscription) {
      console.log('Unsubscribing from browser...');
      await subscription.unsubscribe();
      console.log('Browser unsubscribe successful');
      
      // Remove from database
      console.log('Removing from database...');
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('endpoint', subscription.endpoint);

      if (error) {
        console.error('Error removing subscription from database:', error);
        return false;
      } else {
        console.log('Database removal successful');
      }
    } else {
      console.log('No browser subscription found, only removing from database...');
      // Still try to remove from database in case there's orphaned data
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing subscription from database:', error);
        return false;
      }
    }

    return true;

  } catch (error) {
    console.error('Error unsubscribing:', error);
    return false;
  }
};
