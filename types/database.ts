export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          user_id: string;
          title?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          user_id?: string | null;
          title?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string | null;
          conversation_id: string;
          role: string;
          content: string;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          conversation_id?: string | null;
          role?: string | null;
          content?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          user_id: string;
          title?: string | null;
          content: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          user_id?: string | null;
          title?: string | null;
          content?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Note = Database['public']['Tables']['notes']['Row'];
