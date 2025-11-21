import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { license_id, name, cid } = req.body;

    if (!license_id || !name || !cid) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Insert submission
    const { data, error } = await supabase
      .from('submissions')
      .insert([{ license_id, name, cid }]);

    if (error) throw error;

    res.status(200).json({ success: true, data });

  } catch (err) {
    console.error("Submit form error:", err);
    res.status(500).json({ error: true, message: err.message });
  }
}
