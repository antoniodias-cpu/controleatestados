const tableBody = document.getElementById("users-tbody");
const refreshButton = document.getElementById("btn-atualizar");
const backButton = document.getElementById("btn-voltar");

const ADMIN_EMAIL = "admin@profe.sed.sc.gov.br";

let supabaseClient = null;
let supabaseClientPromise = null;
let adminAccessToken = "";

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

async function loadSupabaseConfig() {
  const localConfig = window.SUPABASE_CONFIG || {};

  if (isConfigured(localConfig)) {
    return localConfig;
  }

  const response = await fetch("/api/config");

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar a configuracao do Supabase.");
  }

  return response.json();
}

async function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!supabaseClientPromise) {
    supabaseClientPromise = (async () => {
      const config = await loadSupabaseConfig();

      if (!isConfigured(config) || !window.supabase) {
        throw new Error("Configure o Supabase antes de acessar esta pagina.");
      }

      supabaseClient = window.supabase.createClient(config.url, config.anonKey);
      return supabaseClient;
    })();
  }

  return supabaseClientPromise;
}

function redirectToLogin() {
  window.location.href = "index.html";
}

async function ensureAdminAccess() {
  const client = await getSupabaseClient();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw new Error(error.message || "Falha ao validar sessao.");
  }

  const session = data?.session || null;
  const email = session?.user?.email || "";

  if (!session || !session.access_token) {
    throw new Error("Voce precisa estar logado para acessar esta pagina.");
  }

  if (email.toLowerCase() !== ADMIN_EMAIL) {
    throw new Error("Apenas o usuario admin pode acessar esta pagina.");
  }

  adminAccessToken = session.access_token;
}

function showStatus(message) {
  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = `<tr><td colspan="4" class="status">${message}</td></tr>`;
}

function maskPassword(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return "********";
  }

  return value;
}

function renderUsers(users) {
  if (!tableBody) {
    return;
  }

  if (!Array.isArray(users) || users.length === 0) {
    showStatus("Nenhum usuário encontrado.");
    return;
  }

  const rows = users
    .map((user) => {
      const nome = user.nome || "-";
      const cidade = user.cidade || "-";
      const email = user.email || "-";
      const senha = maskPassword(user.senha_mask);

      return `<tr>
        <td>${nome}</td>
        <td>${cidade}</td>
        <td>${email}</td>
        <td>${senha}</td>
      </tr>`;
    })
    .join("");

  tableBody.innerHTML = rows;
}

async function loadUsers() {
  showStatus("Carregando usuários...");

  try {
    if (!adminAccessToken) {
      throw new Error("Sessao invalida. Faca login novamente.");
    }

    const response = await fetch("/api/users", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${adminAccessToken}`
      }
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || "Falha ao consultar usuarios no servidor.");
    }

    const payload = await response.json();
    renderUsers(payload.users || []);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    showStatus(`Erro: ${message}`);
  }
}

if (refreshButton) {
  refreshButton.addEventListener("click", () => {
    loadUsers();
  });
}

if (backButton) {
  backButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

async function bootstrap() {
  try {
    await ensureAdminAccess();
    await loadUsers();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    showAlert(message);
    redirectToLogin();
  }
}

bootstrap();
