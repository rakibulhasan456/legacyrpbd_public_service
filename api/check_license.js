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

    const { license_id } = req.body;

    if (!license_id) {
      return res.status(400).json({ error: "Missing license_id" });
    }

    // Check if license is allowed
    const { data: allowedData, error: allowedError } = await supabase
      .from('allowed_licenses')
      .select('license_id')
      .eq('license_id', license_id)
      .single();

    if (allowedError && allowedError.code !== 'PGRST116') throw allowedError;

    const allowed = !!allowedData;

    // Check if already submitted
    const { data: submittedData, error: submittedError } = await supabase
      .from('submissions')
      .select('id')
      .eq('license_id', license_id)
      .single();

    if (submittedError && submittedError.code !== 'PGRST116') throw submittedError;

    const submitted = !!submittedData;

    res.status(200).json({ allowed, submitted });

  } catch (err) {
    console.error("Check license error:", err);
    res.status(500).json({ error: true, message: err.message });
  }
}
