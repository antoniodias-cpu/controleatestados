import React, { useEffect, useState } from 'react';
import { TURNOS_15 } from './data/mockData';
import { Atestado, FilterState, User } from './types';
import {
  deleteAtestado,
  getAtestados,
  getCurrentUser,
  resetToInitialData,
  saveAtestado,
  setCurrentUser,
  syncFromSupabase,
} from './utils/storage';
import { exportAtestadosToPDF } from './utils/pdfGenerator';

import { AtestadoDetailModal } from './components/AtestadoDetailModal';
import { AtestadoFormModal } from './components/AtestadoFormModal';
import { AtestadoTable } from './components/AtestadoTable';
import { AuthView } from './components/AuthView';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { FilterBar } from './components/FilterBar';
import { Navbar } from './components/Navbar';
import { SelectAtestadoModal } from './components/SelectAtestadoModal';
import { StatsCards } from './components/StatsCards';
import { TurnoPieChart } from './components/TurnoPieChart';
import { UserManagementModal } from './components/UserManagementModal';
import { SupabaseStatusModal } from './components/SupabaseStatusModal';

import { Edit3, FileText, Plus, Shield, Trash2, User as UserIcon, Users } from 'lucide-react';

const initialFilterState: FilterState = {
  busca: '',
  turnoId: 'todos',
  periodo: 'todos',
  curso: 'todos',
  dataInicioFiltro: '',
  dataFiltroTermino: '',
  status: 'todos',
};

export default function App() {
  const [currentUser, setCurrentUserSession] = useState<User | null>(null);
  const [atestados, setAtestados] = useState<Atestado[]>([]);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAtestado, setEditingAtestado] = useState<Atestado | null>(null);
  const [viewingAtestado, setViewingAtestado] = useState<Atestado | null>(null);
  const [deletingAtestado, setDeletingAtestado] = useState<Atestado | null>(null);
  const [selectModalMode, setSelectModalMode] = useState<'edit' | 'delete' | null>(null);
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Load session & data on mount + attempt Supabase sync
  useEffect(() => {
    const session = getCurrentUser();
    if (session) {
      setCurrentUserSession(session);
    }
    setAtestados(getAtestados());

    // Sincronizar silenciosamente do Supabase caso existam dados salvos na nuvem
    syncFromSupabase().then(res => {
      if (res.atestados && res.atestados.length > 0) {
        setAtestados(res.atestados);
      }
    }).catch(err => console.warn('Sync inicial Supabase error:', err));
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUserSession(user);
    setCurrentUser(user);
    setAtestados(getAtestados());
  };

  const handleLogout = () => {
    setCurrentUserSession(null);
    setCurrentUser(null);
  };

  const handleResetData = () => {
    if (window.confirm('Deseja restaurar os dados de exemplo demonstrativos do sistema?')) {
      const reset = resetToInitialData();
      setAtestados(reset);
      setFilters(initialFilterState);
    }
  };

  // Handlers CRUD
  const handleSaveAtestado = (atestadoToSave: Atestado) => {
    const updated = saveAtestado(atestadoToSave);
    setAtestados(updated);
  };

  const handleDeleteConfirm = (id: string) => {
    const updated = deleteAtestado(id);
    setAtestados(updated);
  };

  const handleOpenNewModal = () => {
    setEditingAtestado(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item: Atestado) => {
    setEditingAtestado(item);
    setIsFormModalOpen(true);
  };

  const handleOpenEditSelector = () => {
    setSelectModalMode('edit');
  };

  const handleOpenDeleteSelector = () => {
    setSelectModalMode('delete');
  };

  // Filtragem dos atestados
  const todayStr = new Date().toISOString().slice(0, 10);

  const filteredAtestados = atestados.filter(item => {
    // Busca por texto
    if (filters.busca) {
      const term = filters.busca.toLowerCase();
      const matchNome = item.nomeAluno.toLowerCase().includes(term);
      const matchCurso = item.curso.toLowerCase().includes(term);
      const matchMotivo = (item.motivo || '').toLowerCase().includes(term);
      const matchCrm = (item.crmMedico || '').toLowerCase().includes(term);
      if (!matchNome && !matchCurso && !matchMotivo && !matchCrm) {
        return false;
      }
    }

    // Filtro por 15 Turnos específicos
    if (filters.turnoId !== 'todos' && item.turnoId !== filters.turnoId) {
      return false;
    }

    // Filtro por Período
    if (filters.periodo !== 'todos' && item.turnoPeriodo !== filters.periodo) {
      return false;
    }

    // Filtro por Curso (Livre digitação de até 15 cursos separados somente por espaço)
    if (filters.curso && filters.curso !== 'todos') {
      const courseTokens = filters.curso.toLowerCase().trim().split(/\s+/).filter(Boolean);
      if (courseTokens.length > 0) {
        const itemCursoLower = item.curso.toLowerCase();
        const matchesAnyCourse = courseTokens.some(token => itemCursoLower.includes(token));
        if (!matchesAnyCourse) {
          return false;
        }
      }
    }

    // Filtro de Data de Início
    if (filters.dataInicioFiltro && item.dataInicio < filters.dataInicioFiltro) {
      return false;
    }

    // Filtro de Data de Término
    if (filters.dataFiltroTermino && item.dataTermino > filters.dataFiltroTermino) {
      return false;
    }

    // Status
    if (filters.status === 'vigente') {
      const isVigente = item.dataInicio <= todayStr && item.dataTermino >= todayStr;
      if (!isVigente) return false;
    } else if (filters.status === 'concluido') {
      const isConcluido = item.dataTermino < todayStr;
      if (!isConcluido) return false;
    }

    return true;
  });

  // Handler Exportar PDF
  const handleExportPDF = async () => {
    if (!currentUser) return;
    await exportAtestadosToPDF(filteredAtestados, filters, TURNOS_15, currentUser);
  };

  // Se não estiver logado, exibe a tela de login/cadastro/recuperação
  if (!currentUser) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = currentUser.role === 'admin' || currentUser.email.toLowerCase().trim() === 'admin@profe.sed.sc.gov.br';

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col antialiased">
      
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        onOpenNewModal={isAdmin ? handleOpenNewModal : undefined}
        onOpenEditSelector={isAdmin ? handleOpenEditSelector : undefined}
        onOpenDeleteSelector={isAdmin ? handleOpenDeleteSelector : undefined}
        onOpenUserManagementModal={isAdmin ? () => setIsUserManagementModalOpen(false) || setIsUserManagementModalOpen(true) : undefined}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner de Boas-Vindas & Papel */}
        <div className="mb-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-bold text-blue-400">
                Painel Acadêmico
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300">
                {isAdmin ? 'Acesso Administrativo Completo' : 'Acesso de Consulta de Relatórios'}
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Bem-vindo(a), {currentUser.nome}!
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {isAdmin
                ? 'Você possui privilégios de cadastro, edição, exclusão e atualização dos atestados.'
                : 'Você possui permissão para consultar atestados com filtros e exportar relatórios PDF.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {isAdmin ? (
              <>
                <button
                  onClick={handleOpenNewModal}
                  id="btn-novo-atestado-banner"
                  className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer focus:ring-2 focus:ring-blue-400"
                  title="Cadastrar Novo Atestado"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Atestado</span>
                </button>
                <button
                  onClick={handleOpenEditSelector}
                  id="btn-editar-atestado-banner"
                  className="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer focus:ring-2 focus:ring-amber-400"
                  title="Editar Atestado Existente"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Editar Atestado</span>
                </button>
                <button
                  onClick={handleOpenDeleteSelector}
                  id="btn-apagar-atestado-banner"
                  className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer focus:ring-2 focus:ring-rose-400"
                  title="Apagar Atestado Existente"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Apagar Atestado</span>
                </button>
                <button
                  onClick={() => setIsUserManagementModalOpen(true)}
                  id="btn-gerenciar-usuarios-banner"
                  className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer focus:ring-2 focus:ring-purple-400"
                  title="Gerenciar Usuários do Sistema"
                >
                  <Users className="w-4 h-4" />
                  <span>Gerenciar Usuários</span>
                </button>
              </>
            ) : (
              <div className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-blue-400" />
                <span>Perfil de Consulta</span>
              </div>
            )}
          </div>
        </div>

        {/* Métricas e Estatísticas */}
        <StatsCards atestados={atestados} />

        {/* Barra de Filtros (15 Turnos, Busca, Período, Exportar PDF) */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={() => setFilters(initialFilterState)}
          onExportPDF={handleExportPDF}
          totalFilteredCount={filteredAtestados.length}
          user={currentUser}
        />

        {/* Tabela de Atestados */}
        <AtestadoTable
          atestados={filteredAtestados}
          user={currentUser}
          onView={item => setViewingAtestado(item)}
          onEdit={handleOpenEditModal}
          onDeleteRequest={item => setDeletingAtestado(item)}
        />

        {/* Gráfico em Pizza de Atestados por Turno */}
        <TurnoPieChart atestados={filteredAtestados} />

      </main>

      {/* Modais */}
      {/* 1. Modal de Cadastro/Edição (Admin) */}
      <AtestadoFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingAtestado(null);
        }}
        onSave={handleSaveAtestado}
        atestadoParaEditar={editingAtestado}
        currentUser={currentUser}
      />

      {/* 2. Modal de Detalhes / Leitura */}
      <AtestadoDetailModal
        atestado={viewingAtestado}
        onClose={() => setViewingAtestado(null)}
      />

      {/* 3. Modal de Confirmação de Exclusão (Admin) */}
      <DeleteConfirmModal
        isOpen={!!deletingAtestado}
        atestado={deletingAtestado}
        onClose={() => setDeletingAtestado(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* 4. Modal de Seleção para Editar/Apagar via Botões Superiores */}
      <SelectAtestadoModal
        isOpen={!!selectModalMode}
        mode={selectModalMode || 'edit'}
        atestados={atestados}
        onClose={() => setSelectModalMode(null)}
        onSelect={(selected) => {
          if (selectModalMode === 'edit') {
            handleOpenEditModal(selected);
          } else if (selectModalMode === 'delete') {
            setDeletingAtestado(selected);
          }
          setSelectModalMode(null);
        }}
      />

      {/* 5. Modal de Gerenciamento de Usuários (Admin) */}
      <UserManagementModal
        isOpen={isUserManagementModalOpen}
        onClose={() => setIsUserManagementModalOpen(false)}
        currentUser={currentUser}
      />

      {/* 6. Modal de Integração / Status do Banco de Dados Supabase */}
      <SupabaseStatusModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onDataSynced={(syncedAtestados) => {
          setAtestados(syncedAtestados);
        }}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>Sistema de Gestão de Atestados Acadêmicos • Desenvolvido para Controle Institucional</p>
      </footer>

    </div>
  );
}
