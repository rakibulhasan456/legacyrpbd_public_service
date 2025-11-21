// api/check_license.js
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: true, message: 'Method not allowed' });
    return;
  }

  const { license_id } = req.body || {};
  if (!license_id || typeof license_id !== 'string') {
    res.status(400).json({ error: true, message: 'Missing license_id' });
    return;
  }

  // sanitize basic - allow common characters
  const safeId = license_id.replace(/[^\w\-\s@\.]/g, '').trim();

  try {
    // check submitted first
    const submittedUrl = `${SUPABASE_URL}/rest/v1/license_submissions?license_id=eq.${encodeURIComponent(safeId)}&select=*`;
    const allowedUrl = `${SUPABASE_URL}/rest/v1/allowed_licenses?license_id=eq.${encodeURIComponent(safeId)}&select=*`;

    const headers = {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };

    const [submittedResp, allowedResp] = await Promise.all([
      fetch(submittedUrl, { headers }),
      fetch(allowedUrl, { headers })
    ]);

    if (!submittedResp.ok || !allowedResp.ok) {
      res.status(500).json({ error: true, message: 'Supabase request failed' });
      return;
    }

    const submittedData = await submittedResp.json();
    const allowedData = await allowedResp.json();

    res.json({
      error: false,
      allowed: Array.isArray(allowedData) && allowedData.length > 0,
      submitted: Array.isArray(submittedData) && submittedData.length > 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
}
