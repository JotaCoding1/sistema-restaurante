// identity.view — tela de login e topo com os dados do usuário.

import { icon } from "../../shared/icons.js";
import { brand, mountTopbar } from "../../shared/layout.js";
import { toast } from "../../shared/dom.js";
import { ROLES, homeFor, getUser, logout } from "./identity.session.js";
import { login, DEMO_PASSWORD, DEMO_ACCOUNTS } from "./identity.auth.js";

// Topo das telas internas: áreas do restaurante com a do papel ativa
export function mountUserTopbar(user) {
  let switching = false;
  const topbar = mountTopbar({
    userName: user.name,
    roleLabel: ROLES[user.role]?.label ?? "",
    areas: Object.entries(ROLES).map(([key, r]) => ({
      label: r.area,
      icon: r.icon,
      active: key === user.role,
      hint: `Entrar na conta de demonstração de ${r.area}`,
      onSelect: () => switchAccount(key)
    })),
    onLogout: logout
  });

  async function switchAccount(role) {
    if (switching || role === user.role) return;
    const account = DEMO_ACCOUNTS.find((demo) => demo.role === role);
    if (!account) return;

    switching = true;
    topbar.setBusy(true);
    try {
      const selected = await login(account.email, DEMO_PASSWORD);
      window.location.href = homeFor(selected);
      // Mantém os botões bloqueados até a nova página assumir a sessão.
    } catch (err) {
      switching = false;
      topbar.setBusy(false);
      toast(`Não foi possível trocar para ${ROLES[role].area}. ${err.message}`, "error");
    }
  }
}

// Tela de login completa dentro de `root`
export function mountLoginView(root) {
  const current = getUser();
  if (current) {
    window.location.replace(homeFor(current));
    return;
  }

  root.innerHTML = `
    <main class="login">
      <section class="login-photo">
        ${brand()}
        <div class="login-quote">
          <p class="login-quote-title">O cuidado começa antes do primeiro prato.</p>
          <p class="login-quote-sub">Uma boa experiência à mesa.</p>
        </div>
      </section>

      <section class="login-side">
        <span class="demo-badge">${icon("flask")}Ambiente de demonstração</span>

        <form class="login-form" novalidate>
          <header class="login-head">
            <p class="eyebrow eyebrow--plain">Bem-vindo à mesa</p>
            <h1 class="login-title">Vamos começar?</h1>
            <p class="login-sub">Entre na sua conta para acompanhar o ritmo do restaurante.</p>
          </header>

          <div class="field">
            <label for="email">E-mail</label>
            <input class="input" id="email" name="email" type="email" autocomplete="username"
                   placeholder="seuemail@restaurante.com" required />
          </div>

          <div class="field">
            <label for="password">Senha</label>
            <div class="input-wrap">
              <input class="input" id="password" name="password" type="password"
                     autocomplete="current-password" placeholder="Sua senha" required />
              <button class="input-action" type="button" data-toggle-password></button>
            </div>
          </div>

          <p class="form-error" data-error hidden></p>

          <button class="btn btn--primary btn--lg btn--block btn--split" type="submit">
            <span data-label>Entrar</span>${icon("arrowRight", "icon--lg")}
          </button>

          <div class="demo">
            <p class="demo-title">Contas de demonstração</p>
            <div class="demo-grid">
              ${DEMO_ACCOUNTS.map((d) => `
                <button type="button" class="demo-account" data-email="${d.email}" title="${d.email}">
                  ${icon(ROLES[d.role].icon)}<span>${ROLES[d.role].label}</span>
                </button>`).join("")}
            </div>
          </div>
        </form>
      </section>
    </main>`;

  const form = root.querySelector("form");
  const email = form.elements.email;
  const password = form.elements.password;
  const error = form.querySelector("[data-error]");
  const submit = form.querySelector("[type=submit]");
  const toggle = form.querySelector("[data-toggle-password]");

  const drawToggle = () => {
    const visible = password.type === "text";
    toggle.innerHTML = icon(visible ? "eyeOff" : "eye");
    toggle.setAttribute("aria-label", visible ? "Ocultar senha" : "Mostrar senha");
  };
  toggle.addEventListener("click", () => {
    password.type = password.type === "password" ? "text" : "password";
    drawToggle();
  });
  drawToggle();

  const showError = (msg) => {
    error.textContent = msg;
    error.hidden = false;
  };

  async function signIn() {
    if (submit.disabled) return;
    error.hidden = true;
    if (!email.value.trim() || !password.value) return showError("Informe e-mail e senha.");
    submit.disabled = true;
    submit.querySelector("[data-label]").textContent = "Entrando…";
    try {
      const user = await login(email.value.trim(), password.value);
      window.location.href = homeFor(user);
    } catch (err) {
      showError(err.message);
      submit.disabled = false;
      submit.querySelector("[data-label]").textContent = "Entrar";
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    signIn();
  });

  // Conta de demonstração: preenche e entra direto na tela do perfil
  root.querySelector(".demo-grid").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-email]");
    if (!btn) return;
    email.value = btn.dataset.email;
    password.value = DEMO_PASSWORD;
    signIn();
  });
}
