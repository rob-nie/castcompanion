
export type QuickPhrase = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  order: number | null;
  user_id?: string; // Added user_id as optional since it comes from the database
};

// Define the shape of the data coming from Supabase
export type SupabaseQuickPhrase = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  order?: number | null;
};

