export default function handler(req, res) {
  console.log("API was called"); // check Vercel logs
  res.status(200).json({ message: "Serverless function works!" });
}
