import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        if (typeof window === "undefined") return null;
        const value = document.cookie
          .split("; ")
          .find((row) => row.startsWith(`${key}=`))
          ?.split("=")[1];
        return value ? JSON.parse(decodeURIComponent(value)) : null;
      },
      setItem: (key, value) => {
        if (typeof window === "undefined") return;
        document.cookie = `${key}=${encodeURIComponent(
          value
        )}; path=/; max-age=31536000; SameSite=Lax`;
      },
      removeItem: (key) => {
        if (typeof window === "undefined") return;
        document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
      },
    },
  },
});

export { supabase, supabaseUrl, supabaseAnonKey };
