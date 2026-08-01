function readEnv(...names) {
  for (const name of names) {
    const value = process.env[name];

    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }

  return "";
}

export default function handler(req, res) {
  const url = readEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL");
  const anonKey = readEnv("SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY");

  res.status(200).json({ url, anonKey });
}
