import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Missing env variables" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('allowed_licenses')
      .select('*')
      .limit(1);

    if (error) throw error;

    res.status(200).json({ message: "Supabase works!", data });
  } catch (err) {
    console.error("Supabase error:", err);
    res.status(500).json({ error: "Supabase fetch failed", details: err.message });
  }
}
