const form = document.getElementById("atestado-form");
const tableBody = document.getElementById("atestado-tbody");
const consultButton = document.getElementById("btn-consultar");
const exitButton = document.getElementById("btn-sair");
const saveButton = document.getElementById("btn-gravar");

let supabaseClient = null;
let supabaseClientPromise = null;
let accessToken = "";

function showAlert(message) {
  window.alert(message);
}

function isConfigured(config) {
  return (
    config &&
    typeof config.url === "string" &&
    typeof config.anonKey === "string" &&
    config.url.trim() !== "" &&
    config.anonKey.trim() !== "" &&
    !config.url.includes("COLE_AQUI") &&
    !config.anonKey.includes("COLE_AQUI")
  );
}

function buildConfigErrorMessage(remoteConfig) {
  const missing = Array.isArray(remoteConfig?.missing) ? remoteConfig.missing : [];

  if (missing.length === 0) {
    return "Nao foi possivel carregar a configuracao do Supabase.";
  }

  return `Configuracao do Supabase incompleta. Variaveis faltando: ${missing.join(", ")}.`;
}

async function loadSupabaseConfig() {
  const localConfig = window.SUPABASE_CONFIG || {};

  if (isConfigured(localConfig)) {
    return localConfig;
  }

  const response = await fetch("/api/config");

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar a configuracao do Supabase.");
  }

  const remoteConfig = await response.json();

  if (!isConfigured(remoteConfig)) {
    throw new Error(buildConfigErrorMessage(remoteConfig));
  }

  return remoteConfig;
}

async function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!supabaseClientPromise) {
    supabaseClientPromise = (async () => {
      const config = await loadSupabaseConfig();

      if (!isConfigured(config) || !window.supabase) {
        throw new Error("Configure o Supabase antes de usar esta pagina.");
      }

      supabaseClient = window.supabase.createClient(config.url, config.anonKey);
      return supabaseClient;
    })();
  }

  return supabaseClientPromise;
}

function setLoading(isLoading) {
  if (saveButton) {
    saveButton.disabled = isLoading;
  }

  if (consultButton) {
    consultButton.disabled = isLoading;
  }

  if (exitButton) {
    exitButton.disabled = isLoading;
  }
}

function toApiPayload(item) {
  return {
    nomeCompleto: item.nomeCompleto,
    turma: item.turma,
    turno: item.turno,
    dataEntrega: item.dataEntrega,
    dataInicio: item.dataInicio,
    dataTermino: item.dataTermino,
    horaInicio: item.horaInicio,
    horaTermino: item.horaTermino,
    motivo: item.motivo
  };
}

function fromApiPayload(item) {
  return {
    nomeCompleto: item?.nome_completo || "",
    turma: item?.turma || "",
    turno: item?.turno || "",
    dataEntrega: item?.data_entrega || "",
    dataInicio: item?.data_inicio || "",
    dataTermino: item?.data_termino || "",
    horaInicio: item?.hora_inicio || "",
    horaTermino: item?.hora_termino || "",
    motivo: item?.motivo || ""
  };
}

async function ensureAuthenticatedSession() {
  const client = await getSupabaseClient();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw new Error(error.message || "Falha ao validar sessao.");
  }

  const session = data?.session || null;

  if (!session?.access_token) {
    throw new Error("Voce precisa fazer login para acessar esta pagina.");
  }

  accessToken = session.access_token;
}

async function fetchAtestadosFromApi() {
  if (!accessToken) {
    throw new Error("Sessao invalida. Faca login novamente.");
  }

  const response = await fetch("/api/atestados", {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`
    }
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Falha ao consultar atestados.");
  }

  return Array.isArray(payload.atestados) ? payload.atestados.map(fromApiPayload) : [];
}

async function saveAtestadoToApi(item) {
  if (!accessToken) {
    throw new Error("Sessao invalida. Faca login novamente.");
  }

  const response = await fetch("/api/atestados", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(toApiPayload(item))
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Falha ao gravar atestado.");
  }
}

function renderAtestados(items) {
  if (!tableBody) {
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="9" class="status">Nenhum atestado cadastrado.</td></tr>';
    return;
  }

  const rows = items
    .map((item) => {
      return `<tr>
        <td>${item.nomeCompleto || "-"}</td>
        <td>${item.turma || "-"}</td>
        <td>${item.turno || "-"}</td>
        <td>${item.dataEntrega || "-"}</td>
        <td>${item.dataInicio || "-"}</td>
        <td>${item.dataTermino || "-"}</td>
        <td>${item.horaInicio || "-"}</td>
        <td>${item.horaTermino || "-"}</td>
        <td>${item.motivo || "-"}</td>
      </tr>`;
    })
    .join("");

  tableBody.innerHTML = rows;
}

function collectFormData() {
  if (!form) {
    return null;
  }

  const formData = new FormData(form);

  return {
    nomeCompleto: String(formData.get("nomeCompleto") || "").trim(),
    turma: String(formData.get("turma") || "").trim(),
    turno: String(formData.get("turno") || "").trim(),
    dataEntrega: String(formData.get("dataEntrega") || "").trim(),
    dataInicio: String(formData.get("dataInicio") || "").trim(),
    dataTermino: String(formData.get("dataTermino") || "").trim(),
    horaInicio: String(formData.get("horaInicio") || "").trim(),
    horaTermino: String(formData.get("horaTermino") || "").trim(),
    motivo: String(formData.get("motivo") || "").trim()
  };
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = collectFormData();

    if (!payload) {
      showAlert("Nao foi possivel ler os dados do formulario.");
      return;
    }

    try {
      setLoading(true);
      await saveAtestadoToApi(payload);
      const atestados = await fetchAtestadosFromApi();
      renderAtestados(atestados);
      form.reset();
      showAlert("Dados gravados com sucesso.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado.";
      showAlert(`Falha ao gravar: ${message}`);
    } finally {
      setLoading(false);
    }
  });
}

if (consultButton) {
  consultButton.addEventListener("click", async () => {
    try {
      setLoading(true);
      const atestados = await fetchAtestadosFromApi();
      renderAtestados(atestados);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado.";
      showAlert(`Falha na consulta: ${message}`);
    } finally {
      setLoading(false);
    }
  });
}

if (exitButton) {
  exitButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

function redirectToLogin() {
  window.location.href = "index.html";
}

async function bootstrap() {
  try {
    setLoading(true);
    await ensureAuthenticatedSession();
    const atestados = await fetchAtestadosFromApi();
    renderAtestados(atestados);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    showAlert(message);
    redirectToLogin();
  } finally {
    setLoading(false);
  }
}

bootstrap();
