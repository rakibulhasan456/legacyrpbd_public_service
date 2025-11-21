import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase.from('allowed_licenses').select('*').limit(1);
    if (error) throw error;
    res.status(200).json({ message: "Supabase works!", data });
  } catch (err) {
    console.error("Supabase error:", err);
    res.status(500).json({ error: true, message: err.message });
  }
}
