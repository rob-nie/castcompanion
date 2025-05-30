
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function getProjectMembers(supabaseClient: any, projectId: string, senderId: string) {
  const { data: projectMembers, error: membersError } = await supabaseClient
    .from('project_members')
    .select('user_id')
    .eq('project_id', projectId)
    .neq('user_id', senderId)

  if (membersError) {
    console.error('Error fetching project members:', membersError)
    throw new Error('Failed to fetch project members')
  }

  return projectMembers || []
}

export async function getPushSubscriptions(supabaseClient: any, memberIds: string[]) {
  if (memberIds.length === 0) {
    return []
  }

  const { data: subscriptions, error: subscriptionsError } = await supabaseClient
    .from('push_subscriptions')
    .select('*')
    .in('user_id', memberIds)

  if (subscriptionsError) {
    console.error('Error fetching subscriptions:', subscriptionsError)
    throw new Error('Failed to fetch subscriptions')
  }

  return subscriptions || []
}
