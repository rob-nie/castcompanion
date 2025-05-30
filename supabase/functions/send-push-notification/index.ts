
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

    const notifications = subscriptions.map(async (subscription) => {
      try {
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: subscription.endpoint.split('/').pop(),
            notification: payload,
            webpush: {
              headers: {
                'TTL': '3600'
              },
              notification: payload
            }
          }),
        })

        if (!response.ok) {
          console.error(`Failed to send notification to ${subscription.user_id}:`, await response.text())
        }

        return { success: response.ok, userId: subscription.user_id }
      } catch (error) {
        console.error(`Error sending notification to ${subscription.user_id}:`, error)
        return { success: false, userId: subscription.user_id, error: error.message }
      }
    })

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
