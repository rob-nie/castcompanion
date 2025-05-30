
import { supabase } from '@/integrations/supabase/client';
import { registerServiceWorker } from './serviceWorker';

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
