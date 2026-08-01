const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("btn-entrar");
const recoverButton = document.getElementById("btn-recuperar");
const registerButton = document.getElementById("btn-registrar");
const usersButton = document.getElementById("btn-usuarios");

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
        throw new Error("Configure o Supabase antes de usar o login.");
      }

      supabaseClient = window.supabase.createClient(config.url, config.anonKey);
      return supabaseClient;
    })();
  }

  return supabaseClientPromise;
}

function setLoading(isLoading) {
  if (loginButton) {
    loginButton.disabled = isLoading;
  }

  if (recoverButton) {
    recoverButton.disabled = isLoading;
  }

  if (registerButton) {
    registerButton.disabled = isLoading;
  }

  if (usersButton) {
    usersButton.disabled = isLoading;
  }
}

function getCredentials() {
  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value : "";
  return { email, password };
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const { email, password } = getCredentials();

    if (!email || !password) {
      showMessage("Preencha e-mail e senha para entrar.");
      return;
    }

    try {
      setLoading(true);
      const client = await getSupabaseClient();

      const { error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        showMessage(`Falha no login: ${error.message}`);
        return;
      }

      showMessage("Login realizado com sucesso.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado.";
      showMessage(`Falha no login: ${message}`);
    } finally {
      setLoading(false);
    }
  });
}

if (recoverButton) {
  recoverButton.addEventListener("click", async () => {
    const { email } = getCredentials();

    if (!email) {
      showMessage("Digite o e-mail para recuperar a senha.");
      return;
    }

    try {
      setLoading(true);
      const client = await getSupabaseClient();

      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.href
      });

      if (error) {
        showMessage(`Falha ao enviar recuperação: ${error.message}`);
        return;
      }

      showMessage("Link de recuperação enviado para o e-mail informado.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado.";
      showMessage(`Falha ao enviar recuperação: ${message}`);
    } finally {
      setLoading(false);
    }
  });
}

if (registerButton) {
  registerButton.addEventListener("click", () => {
    window.location.assign("novousuario.html");
  });
}

if (usersButton) {
  usersButton.addEventListener("click", () => {
    window.location.assign("usuarios.html");
  });
}
