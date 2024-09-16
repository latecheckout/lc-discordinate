import { createClient } from "@supabase/supabase-js";
import { Database } from "../database.types";

export const client = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
