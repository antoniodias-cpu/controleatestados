const registerForm = document.getElementById("register-form");
const nameInput = document.getElementById("register-name");
const cityInput = document.getElementById("register-city");
const emailInput = document.getElementById("register-email");
const passwordInput = document.getElementById("register-password");
const registerButton = document.getElementById("btn-cadastrar");
const backButton = document.getElementById("btn-voltar");

let supabaseClient = null;
let supabaseClientPromise = null;

function showMessage(message) {
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
    throw new Error("Não foi possível carregar a configuração do Supabase.");
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
        throw new Error("Configure o Supabase antes de usar o cadastro.");
      }

      supabaseClient = window.supabase.createClient(config.url, config.anonKey);
      return supabaseClient;
    })();
  }

  return supabaseClientPromise;
}

function setLoading(isLoading) {
  if (registerButton) {
    registerButton.disabled = isLoading;
  }

  if (backButton) {
    backButton.disabled = isLoading;
  }
}

if (backButton) {
  backButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = nameInput ? nameInput.value.trim() : "";
    const city = cityInput ? cityInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!name || !city || !email || !password) {
      showMessage("Preencha nome, cidade, e-mail e nova senha.");
      return;
    }

    if (password.length < 6) {
      showMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);
      const client = await getSupabaseClient();

      const { error } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            nome: name,
            cidade: city
          }
        }
      });

      if (error) {
        showMessage(`Falha no cadastro: ${error.message}`);
        return;
      }

      showMessage("Cadastro realizado. Verifique seu e-mail para confirmar a conta.");
      window.location.href = "index.html";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado.";
      showMessage(`Falha no cadastro: ${message}`);
    } finally {
      setLoading(false);
    }
  });
}
