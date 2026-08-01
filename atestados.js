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

function mapAtestadoInput(body) {
  return {
    nome_completo: String(body?.nomeCompleto || "").trim(),
    turma: String(body?.turma || "").trim(),
    turno: String(body?.turno || "").trim(),
    data_entrega: String(body?.dataEntrega || "").trim(),
    data_inicio: String(body?.dataInicio || "").trim(),
    data_termino: String(body?.dataTermino || "").trim(),
    hora_inicio: String(body?.horaInicio || "").trim(),
    hora_termino: String(body?.horaTermino || "").trim(),
    motivo: String(body?.motivo || "").trim()
  };
}

function validateAtestadoInput(data) {
  return (
    data.nome_completo &&
    data.turma &&
    data.turno &&
    data.data_entrega &&
    data.data_inicio &&
    data.data_termino &&
    data.hora_inicio &&
    data.hora_termino &&
    data.motivo
  );
}

async function getAuthenticatedUser({ url, anonKey, token }) {
  const authResponse = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`
    }
  });

  const authData = await authResponse.json().catch(() => ({}));

  if (!authResponse.ok || !authData?.id) {
    return null;
  }

  return authData;
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
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
    const user = await getAuthenticatedUser({ url, anonKey, token });

    if (!user) {
      return res.status(401).json({ error: "Sessao invalida ou expirada." });
    }

    if (req.method === "GET") {
      const endpoint = `${url}/rest/v1/atestados?select=id,nome_completo,turma,turno,data_entrega,data_inicio,data_termino,hora_inicio,hora_termino,motivo,created_at&user_id=eq.${user.id}&order=created_at.desc`;

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
          error: "Falha ao consultar atestados no Supabase.",
          detail: bodyText
        });
      }

      const atestados = bodyText ? JSON.parse(bodyText) : [];
      return res.status(200).json({ atestados });
    }

    const input = mapAtestadoInput(req.body || {});

    if (!validateAtestadoInput(input)) {
      return res.status(400).json({ error: "Todos os campos do atestado sao obrigatorios." });
    }

    const payload = {
      user_id: user.id,
      ...input
    };

    const response = await fetch(`${url}/rest/v1/atestados`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(payload)
    });

    const bodyText = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Falha ao gravar atestado no Supabase.",
        detail: bodyText
      });
    }

    const saved = bodyText ? JSON.parse(bodyText) : [];
    return res.status(201).json({ atestado: saved[0] || null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado no servidor.";
    return res.status(500).json({ error: message });
  }
}
