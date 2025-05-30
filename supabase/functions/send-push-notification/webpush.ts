
import type { NotificationPayload, WebPushResult } from './types.ts';
import { base64urlToUint8Array } from './utils.ts';

// Function to send Web Push notification
export async function sendWebPushNotification(
  endpoint: string,
  p256dhKey: string,
  authKey: string,
  payload: NotificationPayload,
  vapidPrivateKey: string
): Promise<WebPushResult> {
  try {
    // Convert VAPID private key from base64url to raw bytes
    const vapidKeyBytes = base64urlToUint8Array(vapidPrivateKey);
    
    // Import the VAPID private key
    const vapidKey = await crypto.subtle.importKey(
      'raw',
      vapidKeyBytes,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );

    // Create JWT header and payload for VAPID
    const jwtHeader = {
      typ: 'JWT',
      alg: 'ES256'
    };

    const jwtPayload = {
      aud: new URL(endpoint).origin,
      exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
      sub: 'mailto:admin@example.com'
    };

    // Create JWT signature
    const encoder = new TextEncoder();
    const headerB64 = btoa(JSON.stringify(jwtHeader)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const payloadB64 = btoa(JSON.stringify(jwtPayload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const unsignedToken = `${headerB64}.${payloadB64}`;
    
    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      vapidKey,
      encoder.encode(unsignedToken)
    );

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    const jwt = `${unsignedToken}.${signatureB64}`;

    // Prepare push message
    const payloadStr = JSON.stringify(payload);
    const payloadBuffer = encoder.encode(payloadStr);

    // Send the push notification
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `vapid t=${jwt}, k=${Deno.env.get('VAPID_PUBLIC_KEY')}`,
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'TTL': '3600'
      },
      body: payloadBuffer
    });

    return { success: response.ok, status: response.status };
  } catch (error) {
    console.error('Error sending web push notification:', error);
    return { success: false, error: error.message };
  }
}
