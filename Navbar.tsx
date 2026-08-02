import React from 'react';
import { User } from '../types';
import { FileText, LogOut, PlusCircle, Edit3, Trash2, RefreshCw, Shield, User as UserIcon, Users, Database } from 'lucide-react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onOpenNewModal?: () => void;
  onOpenEditSelector?: () => void;
  onOpenDeleteSelector?: () => void;
  onOpenUserManagementModal?: () => void;
  onOpenSupabaseModal?: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenNewModal,
  onOpenEditSelector,
  onOpenDeleteSelector,
  onOpenUserManagementModal,
  onOpenSupabaseModal,
  onResetData,
}) => {
  const isAdmin = user.role === 'admin' || user.email.toLowerCase().trim() === 'admin@profe.sed.sc.gov.br';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg shadow-inner">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Gestão de Atestados 2026
              <span className="text-xs bg-blue-500/20 text-blue-300 font-medium px-2 py-0.5 rounded-full border border-blue-400/30">
                v2.0
              </span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Controle Acadêmico & Relatórios PDF
            </p>
          </div>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Admin specific actions */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {onOpenNewModal && (
                <button
                  onClick={onOpenNewModal}
                  id="btn-novo-atestado-nav"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
                  title="Cadastrar Novo Atestado"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden md:inline">Cadastrar Atestado</span>
                  <span className="md:hidden">Cadastrar</span>
                </button>
              )}

              {onOpenEditSelector && (
                <button
                  onClick={onOpenEditSelector}
                  id="btn-editar-atestado-nav"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
                  title="Editar Atestado Existente"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden md:inline">Editar Atestado</span>
                  <span className="md:hidden">Editar</span>
                </button>
              )}

              {onOpenDeleteSelector && (
                <button
                  onClick={onOpenDeleteSelector}
                  id="btn-apagar-atestado-nav"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
                  title="Apagar Atestado Existente"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden md:inline">Apagar Atestado</span>
                  <span className="md:hidden">Apagar</span>
                </button>
              )}

              {onOpenUserManagementModal && (
                <button
                  onClick={onOpenUserManagementModal}
                  id="btn-gerenciar-usuarios-nav"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
                  title="Gerenciar Usuários do Sistema"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden md:inline">Gerenciar Usuários</span>
                  <span className="md:hidden">Usuários</span>
                </button>
              )}
            </div>
          )}

          {/* Supabase Database Sync Modal Button */}
          {onOpenSupabaseModal && (
            <button
              onClick={onOpenSupabaseModal}
              id="btn-supabase-modal-nav"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              title="Banco de Dados Supabase (Nuvem)"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline">Supabase</span>
            </button>
          )}

          {/* Reset Data option */}
          <button
            onClick={onResetData}
            title="Restaurar dados demonstrativos"
            id="btn-reset-data-nav"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* User Badge & Logout */}
          <div className="flex items-center space-x-3 border-l border-slate-800 pl-3">
            <div className="text-right hidden md:block">
              <div className="text-sm font-medium text-slate-200 leading-none">
                {user.nome}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center justify-end gap-1">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 text-amber-400 font-semibold bg-amber-400/10 px-1.5 py-0.5 rounded text-[10px]">
                    <Shield className="w-3 h-3" /> ADMIN
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-300 font-semibold bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                    <UserIcon className="w-3 h-3" /> USUÁRIO COMUM
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onLogout}
              id="btn-logout"
              title="Sair do sistema"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Sair</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};

