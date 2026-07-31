const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const recoverButton = document.getElementById("btn-recuperar");
const registerButton = document.getElementById("btn-registrar");

function showMessage(message) {
  window.alert(message);
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (!email || !password) {
      showMessage("Preencha e-mail e senha para entrar.");
      return;
    }

    showMessage("Login validado localmente. Conecte o backend para autenticar.");
  });
}

if (recoverButton) {
  recoverButton.addEventListener("click", () => {
    showMessage("Fluxo de recuperação de senha em preparação.");
  });
}

if (registerButton) {
  registerButton.addEventListener("click", () => {
    showMessage("Fluxo de cadastro de novo usuário em preparação.");
  });
}
