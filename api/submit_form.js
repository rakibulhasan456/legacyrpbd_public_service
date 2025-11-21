// api/submit_form.js
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: true, message: 'Method not allowed' });
    return;
  }

  const { license_id, name, cid } = req.body || {};
  if (!license_id || !name || !cid) {
    res.status(400).json({ error: true, message: 'Missing fields' });
    return;
  }

  const safeId = license_id.replace(/[^\w\-\s@\.]/g, '').trim();
  const safeName = String(name).slice(0, 300);
  const safeCid = String(cid).slice(0, 100);

  try {
    const headers = {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Prefer: 'return=representation'
    };

    // 1) check allowed
    const allowedUrl = `${SUPABASE_URL}/rest/v1/allowed_licenses?license_id=eq.${encodeURIComponent(safeId)}&select=*`;
    const allowedResp = await fetch(allowedUrl, { headers });
    if (!allowedResp.ok) {
      res.status(500).json({ error: true, message: 'Supabase request failed (allowed check)' });
      return;
    }
    const allowedData = await allowedResp.json();
    if (!Array.isArray(allowedData) || allowedData.length === 0) {
      res.status(403).json({ error: true, message: 'License not allowed' });
      return;
    }

    // 2) check existing submission
    const submittedUrl = `${SUPABASE_URL}/rest/v1/license_submissions?license_id=eq.${encodeURIComponent(safeId)}&select=*`;
    const submittedResp = await fetch(submittedUrl, { headers });
    if (!submittedResp.ok) {
      res.status(500).json({ error: true, message: 'Supabase request failed (submitted check)' });
      return;
    }
    const submittedData = await submittedResp.json();
    if (Array.isArray(submittedData) && submittedData.length > 0) {
      res.status(409).json({ error: true, message: 'License already submitted' });
      return;
    }

    // 3) insert
    const insertUrl = `${SUPABASE_URL}/rest/v1/license_submissions`;
    const insertResp = await fetch(insertUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ license_id: safeId, name: safeName, cid: safeCid })
    });

    if (!insertResp.ok) {
      const text = await insertResp.text();
      console.error('Insert failed', insertResp.status, text);
      res.status(500).json({ error: true, message: 'Insert failed' });
      return;
    }

    const insertResult = await insertResp.json();
    res.json({ error: false, message: 'Inserted', row: insertResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: 'Server error' });
  }
}
