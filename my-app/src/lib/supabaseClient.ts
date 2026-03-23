import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_PROJECT_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export { supabase }