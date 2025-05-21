// types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      Child: {
        Row: {
          id: string;
          name: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          name?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Task: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          value: number;
          isDiscount: boolean;
          isBonus: boolean;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          value: number;
          isDiscount: boolean;
          isBonus: boolean;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          value?: number;
          isDiscount?: boolean;
          isBonus?: boolean;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      CompletedTask: {
        Row: {
          id: string;
          taskId: string;
          childId: string;
          date: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          taskId: string;
          childId: string;
          date?: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          taskId?: string;
          childId?: string;
          date?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
