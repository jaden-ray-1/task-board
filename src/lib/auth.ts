import { getSupabase } from "./supabase";

// Use Supabase's anonymous sign-in
export async function signInAnonymously() {
	const { data, error } = await getSupabase().auth.signInAnonymously();
	if (error) throw error;
	return data;
}
