export default function handler(req, res) {
  try {
    console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
    console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "exists" : "missing");

    res.status(200).json({
      SUPABASE_URL: process.env.SUPABASE_URL ? "exists" : "missing",
      SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "exists" : "missing"
    });
  } catch (err) {
    console.error("Function crashed:", err);
    res.status(500).json({ error: "Function crashed" });
  }
}
