import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Database = {
  public: {
    Tables: {
      water_logs: {
        Row: {
          id: string;
          user_id: string;
          amount_ml: number;
          logged_at: string;
        };
        Insert: {
          user_id: string;
          amount_ml: number;
          logged_at: string;
        };
      };
      profiles: {
        Row: {
          user_id: string;
          water_goal_ml: number;
        };
      };
    };
  };
};
