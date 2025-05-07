
import { supabase } from "@/integrations/supabase/client";
import { Message } from "./types";

// Fetch sender name from profiles table
export const fetchSenderName = async (senderId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', senderId)
      .single();
    
    if (error) {
      console.error('Error fetching sender name:', error);
      return null;
    }
    
    // Extract username from email (everything before @)
    const email = data?.email || null;
    return email ? email.split('@')[0] : null;
  } catch (error) {
    console.error('Error in fetchSenderName:', error);
    return null;
  }
};

// Fetch all messages for a project
export const fetchProjectMessages = async (projectId: string): Promise<Message[]> => {
  try {
    console.log("Fetching messages for project:", projectId);
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
    
    // Fetch sender names for each message
    const messagesWithNames = await Promise.all(
      (data || []).map(async (message: any) => {
        const senderName = await fetchSenderName(message.sender_id);
        return { ...message, sender_name: senderName } as Message;
      })
    );
    
    console.log(`Fetched ${messagesWithNames.length} messages`);
    return messagesWithNames;
  } catch (error) {
    console.error('Error in fetchMessages:', error);
    throw error;
  }
};

// Send a new message
export const sendNewMessage = async (content: string, userId: string, projectId: string): Promise<void> => {
  try {
    console.log(`Sending message as user ${userId} to project ${projectId}`);
    
    const { error } = await supabase
      .from('messages')
      .insert({
        content,
        sender_id: userId,
        project_id: projectId
      });
    
    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  } catch (error) {
    console.error('Exception in sendMessage:', error);
    throw error;
  }
};
