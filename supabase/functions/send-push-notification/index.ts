
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: any
}

// Function to convert base64url to base64
function base64urlToBase64(base64url: string): string {
  return base64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(base64url.length + (4 - base64url.length % 4) % 4, '=');
}

// Function to convert base64url to Uint8Array
function base64urlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64urlToBase64(base64url);
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Function to send Web Push notification
async function sendWebPushNotification(
  endpoint: string,
  p256dhKey: string,
  authKey: string,
  payload: NotificationPayload,
  vapidPrivateKey: string
) {
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { projectId, senderId, messageContent, senderName } = await req.json()

    // Get project members (excluding the sender)
    const { data: projectMembers, error: membersError } = await supabaseClient
      .from('project_members')
      .select('user_id')
      .eq('project_id', projectId)
      .neq('user_id', senderId)

    if (membersError) {
      console.error('Error fetching project members:', membersError)
      return new Response(JSON.stringify({ error: 'Failed to fetch project members' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!projectMembers || projectMembers.length === 0) {
      return new Response(JSON.stringify({ message: 'No recipients found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const memberIds = projectMembers.map(member => member.user_id)

    // Get push subscriptions for these members
    const { data: subscriptions, error: subscriptionsError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .in('user_id', memberIds)

    if (subscriptionsError) {
      console.error('Error fetching subscriptions:', subscriptionsError)
      return new Response(JSON.stringify({ error: 'Failed to fetch subscriptions' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const payload: NotificationPayload = {
      title: `Neue Nachricht von ${senderName || 'Unbekannt'}`,
      body: messageContent.length > 50 ? `${messageContent.substring(0, 50)}...` : messageContent,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        projectId,
        url: `/project/${projectId}`,
        timestamp: Date.now()
      }
    }

    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
    if (!vapidPrivateKey) {
      console.error('VAPID private key not configured')
      return new Response(JSON.stringify({ error: 'VAPID private key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const notifications = subscriptions.map(async (subscription) => {
      const result = await sendWebPushNotification(
        subscription.endpoint,
        subscription.p256dh_key,
        subscription.auth_key,
        payload,
        vapidPrivateKey
      );

      if (!result.success) {
        console.error(`Failed to send notification to ${subscription.user_id}:`, result.error);
      }

      return { 
        success: result.success, 
        userId: subscription.user_id,
        error: result.error
      };
    });

    const results = await Promise.all(notifications)
    const successCount = results.filter(r => r.success).length

    return new Response(JSON.stringify({ 
      message: `Sent ${successCount} notifications`,
      results 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in send-push-notification function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
