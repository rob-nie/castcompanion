
import { toast } from 'sonner';

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const permission = await Notification.requestPermission();
    
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
