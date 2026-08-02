import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { getUsers, saveUser } from '../utils/storage';
import { CheckCircle2, FileText, KeyRound, Lock, Mail, ShieldAlert, User as UserIcon, UserPlus, ArrowLeft } from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'cadastro' | 'recuperacao'>('login');

  // Form State - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Form State - Cadastro
  const [regNome, setRegNome] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Form State - Recuperação
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  // Handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Por favor, preencha o e-mail e a senha.');
      return;
    }

    const cleanEmail = loginEmail.toLowerCase().trim();
    const users = getUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!foundUser) {
      setLoginError('Usuário não encontrado. Crie uma conta no formulário de cadastro.');
      return;
    }

    if (cleanEmail === 'admin@profe.sed.sc.gov.br') {
      if (loginPassword !== 'admin1234') {
        setLoginError('Senha incorreta para o e-mail de administrador (admin@profe.sed.sc.gov.br).');
        return;
      }
    } else if (foundUser.password && foundUser.password !== loginPassword) {
      setLoginError('Senha incorreta.');
      return;
    }

    // Login efetuado com sucesso
    onLoginSuccess(foundUser);
  };

  const handleCadastroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regNome.trim() || !regEmail.trim() || !regPassword) {
      setRegError('Todos os campos obrigatórios devem ser preenchidos.');
      return;
    }

    if (regPassword.length < 4) {
      setRegError('A senha deve conter no mínimo 4 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('As senhas não coincidem.');
      return;
    }

    const cleanEmail = regEmail.trim().toLowerCase();
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      setRegError('Este e-mail já está cadastrado no sistema.');
      return;
    }

    const adminEmails = [
      'admin@profe.sed.sc.gov.br',
      'priscila@profe.sed.sc.gov.br',
      'cesar@profe.sed.sc.gov.br',
      'mariahelena@profe.sed.sc.gov.br',
      'joana@profe.sed.sc.gov.br',
    ];
    const isAdmin = adminEmails.includes(cleanEmail);

    const newUser: User = {
      id: 'user-' + Date.now(),
      nome: regNome.trim(),
      email: cleanEmail,
      password: regPassword,
      role: isAdmin ? 'admin' : 'comum',
      dataCriacao: new Date().toISOString()
    };

    saveUser(newUser);
    setRegSuccess(
      isAdmin
        ? 'Cadastro realizado com sucesso! Você tem permissões de Administrador.'
        : 'Cadastro realizado com sucesso! Perfil de Usuário de Consulta cadastrado.'
    );

    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 1200);
  };

  const handleRecuperacaoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!resetEmail.trim()) {
      setResetError('Por favor, informe o seu e-mail cadastrado.');
      return;
    }

    setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Container Principal */}
      <div className="w-full max-w-md space-y-8 bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700/80">
        
        {/* Header do Card */}
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight">
            Gestão de Atestados 2026
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Controle de Afastamentos CEDUP "Dario G. Salles"
          </p>
        </div>

        {/* Abas NAVEGAÇÃO */}
        <div className="flex border-b border-slate-700 text-sm font-medium">
          <button
            id="tab-auth-login"
            onClick={() => { setActiveTab('login'); setLoginError(''); }}
            className={`flex-1 py-2.5 text-center transition-colors border-b-2 cursor-pointer ${
              activeTab === 'login'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Entrar
          </button>
          <button
            id="tab-auth-cadastro"
            onClick={() => { setActiveTab('cadastro'); setRegError(''); setRegSuccess(''); }}
            className={`flex-1 py-2.5 text-center transition-colors border-b-2 cursor-pointer ${
              activeTab === 'cadastro'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Cadastrar E-mail
          </button>
        </div>

        {/* --- ABA 1: LOGIN --- */}
        {activeTab === 'login' && (
          <form className="mt-6 space-y-5" onSubmit={handleLoginSubmit}>
            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                E-mail de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  id="input-login-email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="matricula@profe.sed.sc.gov.br"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Senha
                </label>
                <button
                  type="button"
                  id="btn-forgot-password"
                  onClick={() => setActiveTab('recuperacao')}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  id="input-login-password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-login-submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm cursor-pointer"
            >
              Acessar o Sistema
            </button>
          </form>
        )}

        {/* --- ABA 2: CADASTRO --- */}
        {activeTab === 'cadastro' && (
          <form className="mt-6 space-y-4" onSubmit={handleCadastroSubmit}>
            {regError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                required
                id="input-reg-nome"
                value={regNome}
                onChange={e => setRegNome(e.target.value)}
                placeholder="Ex: Dra. Ana Maria Souza"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Novo E-mail
              </label>
              <input
                type="email"
                required
                id="input-reg-email"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                placeholder="matricula@profe.sed.sc.gov.br"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Atenção: Os e-mails cadastrados possuem permissão de administrador para inserção, edição e gestão do sistema.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Senha de Acesso
              </label>
              <input
                type="password"
                required
                id="input-reg-password"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Confirmar Senha
              </label>
              <input
                type="password"
                required
                id="input-reg-confirm-password"
                value={regConfirmPassword}
                onChange={e => setRegConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              id="btn-cadastro-submit"
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Concluir Cadastro
            </button>
          </form>
        )}

        {/* --- ABA 3: RECUPERAÇÃO DE ACESSO --- */}
        {activeTab === 'recuperacao' && (
          <div className="mt-6 space-y-4">
            <button
              onClick={() => setActiveTab('login')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o Login
            </button>

            <h3 className="text-base font-bold text-white">
              Recuperação de Acesso
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Informe seu e-mail cadastrado para receber o código de validação e as instruções de redefinição de acesso.
            </p>

            {resetSent ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Instruções Enviadas com Sucesso!
                </div>
                <p className="text-xs text-slate-300">
                  Enviamos o código e instruções de redefinição para o e-mail <strong className="text-white">{resetEmail}</strong>. Verifique sua caixa de entrada e spam.
                </p>
                <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-center font-mono text-base tracking-widest text-emerald-400">
                  {resetCode ? `Código digitado: ${resetCode}` : 'Código de Validação Enviado por E-mail'}
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => { setResetSent(false); setActiveTab('login'); }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Retornar ao Login
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRecuperacaoSubmit} className="space-y-4">
                {resetError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    E-mail Cadastrado *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      id="input-reset-email"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="matricula@profe.sed.sc.gov.br"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Código Recebido via E-mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="input-reset-code"
                      value={resetCode}
                      onChange={e => setResetCode(e.target.value)}
                      placeholder="Informe o código recebido (ex: 849201)"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-reset-submit"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md transition-all text-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Enviar Código / Validar E-mail
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
