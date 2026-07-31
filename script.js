const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("btn-entrar");
const recoverButton = document.getElementById("btn-recuperar");
const registerButton = document.getElementById("btn-registrar");

const supabaseConfig = window.SUPABASE_CONFIG || {};
const hasConfig =
  typeof supabaseConfig.url === "string" &&
  typeof supabaseConfig.anonKey === "string" &&
  !supabaseConfig.url.includes("COLE_AQUI") &&
  !supabaseConfig.anonKey.includes("COLE_AQUI");

const supabaseClient =
  hasConfig && window.supabase
    ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
    : null;

function showMessage(message) {
  window.alert(message);
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
}

function getCredentials() {
  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value : "";
  return { email, password };
}

function ensureSupabaseConfigured() {
  if (supabaseClient) {
    return true;
  }

  showMessage(
    "Configure o arquivo supabase-config.js com URL e ANON KEY do projeto Supabase."
  );
  return false;
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!ensureSupabaseConfigured()) {
      return;
    }

    const { email, password } = getCredentials();

    if (!email || !password) {
      showMessage("Preencha e-mail e senha para entrar.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabaseClient.auth.signInWithPassword({
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
    if (!ensureSupabaseConfigured()) {
      return;
    }

    const { email } = getCredentials();

    if (!email) {
      showMessage("Digite o e-mail para recuperar a senha.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
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
    window.location.href = "novousuario.html";
  });
}
