
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const checkPushNotificationSupport = (): boolean => {
  return 'serviceWorker' in navigator && 
         'PushManager' in window && 
         'Notification' in window;
};
