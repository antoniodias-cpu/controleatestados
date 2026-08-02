import React, { useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { deleteUser, getUsers, saveUser } from '../utils/storage';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  KeyRound,
  Mail,
  Plus,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form Fields
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('comum');

  // Feedback Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Recarregar lista ao abrir
  useEffect(() => {
    if (isOpen) {
      loadUsersList();
      resetForm();
      setErrorMsg('');
      setSuccessMsg('');
      setDeletingUser(null);
    }
  }, [isOpen]);

  const loadUsersList = () => {
    setUsers(getUsers());
  };

  const resetForm = () => {
    setNome('');
    setEmail('');
    setPassword('');
    setRole('comum');
    setEditingUser(null);
    setIsFormOpen(false);
    setErrorMsg('');
  };

  const handleOpenAddForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (user: User) => {
    setEditingUser(user);
    setNome(user.nome);
    setEmail(user.email);
    setPassword(user.password || '');
    setRole(user.role);
    setIsFormOpen(true);
    setErrorMsg('');
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanNome = nome.trim();

    if (!cleanNome || !cleanEmail) {
      setErrorMsg('Por favor, preencha o Nome e o E-mail do usuário.');
      return;
    }

    if (!editingUser && !password) {
      setErrorMsg('Por favor, defina uma senha para o novo usuário.');
      return;
    }

    // Verificar duplicação de e-mail (excluindo o usuário que está sendo editado)
    const existing = users.find(
      u => u.email.toLowerCase().trim() === cleanEmail && u.id !== editingUser?.id
    );

    if (existing) {
      setErrorMsg('Já existe um usuário cadastrado com este e-mail.');
      return;
    }

    const isSuperAdmin = currentUser?.email?.toLowerCase().trim() === 'admin@profe.sed.sc.gov.br';

    // Se estiver tentando alterar um Administrador existente para Usuário Comum e não for o super admin
    if (editingUser?.role === 'admin' && role === 'comum' && !isSuperAdmin) {
      setErrorMsg('Somente o administrador principal (admin@profe.sed.sc.gov.br) tem permissão para alterar Administrador para Usuário Comum.');
      return;
    }

    const adminEmails = [
      'admin@profe.sed.sc.gov.br',
      'priscila@profe.sed.sc.gov.br',
      'cesar@profe.sed.sc.gov.br',
      'mariahelena@profe.sed.sc.gov.br',
      'joana@profe.sed.sc.gov.br',
    ];
    const isDefaultAdmin = adminEmails.includes(cleanEmail);

    let chosenRole: UserRole = role;
    if (!editingUser) {
      // Para novos cadastros, se for um dos e-mails padrão e não for super admin
      if (isDefaultAdmin && !isSuperAdmin) {
        chosenRole = 'admin';
      }
    }

    const userPayload: User = {
      id: editingUser ? editingUser.id : `user-${Date.now()}`,
      nome: cleanNome,
      email: cleanEmail,
      password: password || editingUser?.password || '1234',
      role: chosenRole,
      dataCriacao: editingUser ? editingUser.dataCriacao : new Date().toISOString().slice(0, 10),
    };

    try {
      const updatedList = saveUser(userPayload);
      setUsers(updatedList);
      setSuccessMsg(
        editingUser
          ? `Usuário "${cleanNome}" atualizado com sucesso!`
          : `Usuário "${cleanNome}" cadastrado com sucesso!`
      );
      resetForm();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar usuário.');
    }
  };

  const handleDeleteUser = (user: User) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const updatedList = deleteUser(user.id);
      setUsers(updatedList);
      setDeletingUser(null);
      setSuccessMsg(`Usuário "${user.nome}" excluído com sucesso!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Não foi possível excluir o usuário.');
      setDeletingUser(null);
    }
  };

  if (!isOpen) return null;

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase().trim();
    return (
      u.nome.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header do Modal */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Gerenciamento de Usuários
                <span className="text-xs bg-purple-500/20 text-purple-300 font-semibold px-2 py-0.5 rounded-full border border-purple-400/30">
                  {users.length} cadastrado(s)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Inserir, editar e apagar permissões de acesso ao sistema
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Fechar Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagens de Sucesso ou Erro Globais */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          
          {/* Form Modal / Painel de Cadastro e Edição */}
          {isFormOpen ? (
            <form onSubmit={handleSaveSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  {editingUser ? (
                    <>
                      <Edit3 className="w-4 h-4 text-amber-600" />
                      <span>Editar Usuário: {editingUser.nome}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 text-purple-600" />
                      <span>Cadastrar Novo Usuário</span>
                    </>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Voltar para lista
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nome */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      placeholder="Ex: João da Silva"
                      className="w-full py-2 pl-9 pr-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    E-mail de Acesso *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Ex: usuario@profe.sed.sc.gov.br"
                      className="w-full py-2 pl-9 pr-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Senha {editingUser ? '(deixe em branco p/ manter)' : '*'}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required={!editingUser}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Digite a senha..."
                      className="w-full py-2 pl-9 pr-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Perfil de Acesso */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Perfil de Acesso *
                  </label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={e => {
                        const newRole = e.target.value as UserRole;
                        const isSuperAdmin = currentUser?.email?.toLowerCase().trim() === 'admin@profe.sed.sc.gov.br';
                        if (editingUser?.role === 'admin' && newRole === 'comum' && !isSuperAdmin) {
                          setErrorMsg('Apenas o admin@profe.sed.sc.gov.br tem permissão para alterar Administrador para Usuário Comum.');
                          return;
                        }
                        setErrorMsg('');
                        setRole(newRole);
                      }}
                      className="w-full py-2 pl-9 pr-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="admin">Administrador</option>
                      <option
                        value="comum"
                        disabled={editingUser?.role === 'admin' && currentUser?.email?.toLowerCase().trim() !== 'admin@profe.sed.sc.gov.br'}
                      >
                        Usuário Comum (Consulta)
                      </option>
                    </select>
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  {editingUser?.role === 'admin' && currentUser?.email?.toLowerCase().trim() !== 'admin@profe.sed.sc.gov.br' && (
                    <p className="mt-1 text-[10px] text-amber-700 font-semibold leading-tight">
                      * Apenas admin@profe.sed.sc.gov.br pode alterar Administrador para Usuário Comum.
                    </p>
                  )}
                </div>
              </div>

              {/* Botões de Ação do Form */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Botão para Abrir Formulário de Novo Usuário */
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, e-mail ou perfil..."
                className="py-2 px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white w-full sm:w-72"
              />

              <button
                type="button"
                onClick={handleOpenAddForm}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Inserir Novo Usuário</span>
              </button>
            </div>
          )}

          {/* Modal de Confirmação de Exclusão de Usuário */}
          {deletingUser && (
            <div className="p-4 mb-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-900">
                    Confirma a exclusão do usuário "{deletingUser.nome}"?
                  </h4>
                  <p className="text-[11px] text-rose-700">
                    Esta ação removerá o e-mail ({deletingUser.email}) da lista de acessos.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setDeletingUser(null)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteUser(deletingUser)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sim, Apagar</span>
                </button>
              </div>
            </div>
          )}

          {/* Tabela de Usuários */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-96 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Usuário</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Perfil</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const isProtectedAdmin = [
                      'admin@profe.sed.sc.gov.br',
                      'priscila@profe.sed.sc.gov.br',
                      'cesar@profe.sed.sc.gov.br',
                      'mariahelena@profe.sed.sc.gov.br',
                      'joana@profe.sed.sc.gov.br',
                    ].includes(u.email.toLowerCase().trim());

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {u.nome.charAt(0).toUpperCase()}
                          </div>
                          <span>{u.nome}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{u.email}</td>
                        <td className="py-3 px-4">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              <Shield className="w-3 h-3 text-amber-600" /> Administrador
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                              <UserCheck className="w-3 h-3 text-slate-500" /> Usuário Comum
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Botão Editar */}
                            <button
                              onClick={() => handleOpenEditForm(u)}
                              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title={`Editar usuário ${u.nome}`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Botão Apagar */}
                            {isProtectedAdmin ? (
                              <button
                                disabled
                                className="p-1.5 text-slate-300 cursor-not-allowed"
                                title="Administrador protegido não pode ser apagado"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setDeletingUser(u)}
                                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title={`Apagar usuário ${u.nome}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Apenas administradores podem gerenciar usuários do sistema.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
