
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { NotificationPayload, NotificationResult } from './types.ts'
import { sendWebPushNotification } from './webpush.ts'
import { getProjectMembers, getPushSubscriptions } from './database.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const projectMembers = await getProjectMembers(supabaseClient, projectId, senderId)

    if (projectMembers.length === 0) {
      return new Response(JSON.stringify({ message: 'No recipients found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const memberIds = projectMembers.map(member => member.user_id)

    // Get push subscriptions for these members
    const subscriptions = await getPushSubscriptions(supabaseClient, memberIds)

    if (subscriptions.length === 0) {
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

    const notifications = subscriptions.map(async (subscription): Promise<NotificationResult> => {
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
