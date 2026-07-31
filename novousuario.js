const registerForm = document.getElementById("register-form");
const nameInput = document.getElementById("register-name");
const cityInput = document.getElementById("register-city");
const emailInput = document.getElementById("register-email");
const passwordInput = document.getElementById("register-password");
const registerButton = document.getElementById("btn-cadastrar");
const backButton = document.getElementById("btn-voltar");

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
  if (registerButton) {
    registerButton.disabled = isLoading;
  }

  if (backButton) {
    backButton.disabled = isLoading;
  }
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

if (backButton) {
  backButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!ensureSupabaseConfigured()) {
      return;
    }

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

      const { error } = await supabaseClient.auth.signUp({
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
