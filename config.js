function readEnv(...names) {
  for (const name of names) {
    const value = process.env[name];

    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }

  return "";
}

const ENV_GROUPS = {
  url: ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"],
  anonKey: ["SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"],
  serviceRoleKey: ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY", "SUPABASE_SECRET_KEY"]
};

export default function handler(req, res) {
  const url = readEnv(...ENV_GROUPS.url);
  const anonKey = readEnv(...ENV_GROUPS.anonKey);

  const missing = [];

  if (!url) {
    missing.push("SUPABASE_URL");
  }

  if (!anonKey) {
    missing.push("SUPABASE_ANON_KEY");
  }

  res.status(200).json({
    url,
    anonKey,
    configured: missing.length === 0,
    missing,
    acceptedNames: ENV_GROUPS
  });
}
