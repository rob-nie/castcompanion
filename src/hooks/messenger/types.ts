
export interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string | null;
  project_id: string;
  created_at: string;
}
