import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      res.status(500).json({ error: true, message: "Missing env variables" });
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test fetch allowed licenses (first 5)
    const { data, error } = await supabase
      .from('allowed_licenses')
      .select('*')
      .limit(5);

    if (error) throw error;

    res.status(200).json({ message: "Supabase works!", data });
  } catch (err) {
    console.error("Supabase error:", err);
    res.status(500).json({ error: true, message: "Supabase fetch failed" });
  }
}
