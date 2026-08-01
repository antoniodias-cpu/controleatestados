const ADMIN_EMAIL = "admin@profe.sed.sc.gov.br";

function extractBearerToken(authorizationHeader) {
  if (typeof authorizationHeader !== "string") {
    return "";
  }

  const value = authorizationHeader.trim();

  if (!value.toLowerCase().startsWith("bearer ")) {
    return "";
  }

  return value.slice(7).trim();
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Metodo nao permitido." });
  }

  const url = process.env.SUPABASE_URL || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !anonKey || !serviceRoleKey) {
    return res.status(500).json({
      error: "Variaveis SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY nao configuradas."
    });
  }

  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: "Token de acesso nao informado." });
  }

  try {
    const authResponse = await fetch(`${url}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`
      }
    });

    const authData = await authResponse.json().catch(() => ({}));

    if (!authResponse.ok || !authData?.email) {
      return res.status(401).json({ error: "Sessao invalida ou expirada." });
    }

    if (String(authData.email).toLowerCase() !== ADMIN_EMAIL) {
      return res.status(403).json({ error: "Acesso permitido apenas ao usuario admin." });
    }

    const endpoint = `${url}/rest/v1/user_profiles?select=nome,cidade,email,senha_mask,created_at&order=nome.asc`;

    const response = await fetch(endpoint, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json"
      }
    });

    const bodyText = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Falha ao ler dados no Supabase.",
        detail: bodyText
      });
    }

    const users = bodyText ? JSON.parse(bodyText) : [];
    return res.status(200).json({ users });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado no servidor.";
    return res.status(500).json({ error: message });
  }
}
