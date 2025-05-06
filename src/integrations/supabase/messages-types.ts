
import type { Database } from './types';

// Extend the Database type to include the messages table
declare module './types' {
  interface Database {
    public: {
      Tables: {
        messages: {
          Row: {
            id: string;
            content: string;
            sender_id: string;
            project_id: string;
            created_at: string;
          };
          Insert: {
            id?: string;
            content: string;
            sender_id: string;
            project_id: string;
            created_at?: string;
          };
          Update: {
            id?: string;
            content?: string;
            sender_id?: string;
            project_id?: string;
            created_at?: string;
          };
        } & Database['public']['Tables'];
      };
    };
  }
}
