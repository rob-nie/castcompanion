
import { supabase } from "@/integrations/supabase/client";
import { QuickPhrase, SupabaseQuickPhrase } from "./types";
import { toast } from "sonner";

export const fetchUserPhrases = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("quick_phrases")
      .select("*")
      .order("order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    
    // Convert the data to ensure each item has the order property
    return (data as SupabaseQuickPhrase[]).map(item => ({
      id: item.id,
      content: item.content,
      created_at: item.created_at,
      updated_at: item.updated_at,
      order: item.order !== undefined ? item.order : null,
      user_id: item.user_id
    })) as QuickPhrase[];
  } catch (err: any) {
    throw new Error(`Failed to fetch phrases: ${err.message}`);
  }
};

export const addUserPhrase = async (userId: string, content: string, maxOrder: number) => {
  try {
    const { data, error } = await supabase
      .from("quick_phrases")
      .insert([{ 
        content, 
        user_id: userId,
        order: maxOrder + 1 
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Make sure the returned object has all required fields
    return {
      id: (data as SupabaseQuickPhrase).id,
      content: (data as SupabaseQuickPhrase).content,
      created_at: (data as SupabaseQuickPhrase).created_at,
      updated_at: (data as SupabaseQuickPhrase).updated_at,
      order: (data as SupabaseQuickPhrase).order !== undefined ? (data as SupabaseQuickPhrase).order : null,
      user_id: (data as SupabaseQuickPhrase).user_id
    } as QuickPhrase;
  } catch (err: any) {
    throw new Error(`Failed to add phrase: ${err.message}`);
  }
};

export const updateUserPhrase = async (id: string, content: string) => {
  try {
    const { error } = await supabase
      .from("quick_phrases")
      .update({ content })
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err: any) {
    throw new Error(`Failed to update phrase: ${err.message}`);
  }
};

export const deleteUserPhrase = async (id: string) => {
  try {
    const { error } = await supabase
      .from("quick_phrases")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err: any) {
    throw new Error(`Failed to delete phrase: ${err.message}`);
  }
};

export const updatePhraseOrder = async (updates: { id: string, order: number }[]) => {
  try {
    for (const update of updates) {
      // Only send the order property to update
      const { error } = await supabase
        .from("quick_phrases")
        .update({ order: update.order })
        .eq("id", update.id);
        
      if (error) throw error;
    }
    return true;
  } catch (err: any) {
    throw new Error(`Failed to update order: ${err.message}`);
  }
};
