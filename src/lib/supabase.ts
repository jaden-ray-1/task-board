import { createClient } from "@supabase/supabase-js";

// Attempt to create client with locally saved URL and key
export function getSupabase() {
	const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
	const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

	if (!supabaseUrl || !supabaseKey) {
		throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env.local");
	}

	return createClient(supabaseUrl, supabaseKey);
}
