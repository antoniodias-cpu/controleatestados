import React from 'react';
import { CURSOS_DISPONIVEIS, TURNOS_15 } from '../data/mockData';
import { FilterState, User } from '../types';
import { Calendar, Download, Filter, RefreshCw, Search, X } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  onExportPDF: () => void;
  totalFilteredCount: number;
  user: User;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onExportPDF,
  totalFilteredCount,
  user,
}) => {
  const handleChange = (field: keyof FilterState, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const activeFilterCount = [
    filters.busca ? 1 : 0,
    filters.turnoId !== 'todos' ? 1 : 0,
    filters.periodo !== 'todos' ? 1 : 0,
    filters.curso !== 'todos' ? 1 : 0,
    filters.dataInicioFiltro ? 1 : 0,
    filters.dataFiltroTermino ? 1 : 0,
    filters.status !== 'todos' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 space-y-4">
      
      {/* Top row: Search & Main Buttons */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="input-filter-busca"
            value={filters.busca}
            onChange={e => handleChange('busca', e.target.value)}
            placeholder="Buscar por nome do aluno, curso ou motivo..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          {filters.busca && (
            <button
              onClick={() => handleChange('busca', '')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              id="btn-limpar-filtros"
              className="px-3 py-2 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Limpar Filtros ({activeFilterCount})
            </button>
          )}

          <button
            onClick={onExportPDF}
            id="btn-exportar-pdf"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer focus:ring-2 focus:ring-emerald-400"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Relatório PDF ({totalFilteredCount})</span>
          </button>
        </div>

      </div>

      {/* Grid of filters: 15 Turnos Selector, Period, Course, Date Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
        
        {/* FILTRO DOS 15 CURSOS (Campo de Livre Digitação Separado por Espaço) */}
        <div className="sm:col-span-2 lg:col-span-2">
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Filtro por 15 Cursos</span>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-semibold">Separados por espaço</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="input-filter-curso-livre"
              list="cursos-list-filter"
              value={filters.curso === 'todos' ? '' : filters.curso}
              onChange={e => handleChange('curso', e.target.value)}
              placeholder="Digite os cursos separados por espaço (ex: 1MEC1 1MEC2 2MEC3)..."
              className="w-full py-1.5 pl-3 pr-8 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            {filters.curso && filters.curso !== 'todos' && (
              <button
                type="button"
                onClick={() => handleChange('curso', 'todos')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Limpar filtro de cursos"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <datalist id="cursos-list-filter">
              {CURSOS_DISPONIVEIS.map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Insira até 15 cursos simultaneamente separados apenas por espaços.
          </p>
        </div>

        {/* PERÍODO GERAL */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Turno / Período
          </label>
          <select
            id="select-filter-periodo"
            value={filters.periodo}
            onChange={e => handleChange('periodo', e.target.value)}
            className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          >
            <option value="todos">Todos os Turnos</option>
            <option value="Matutino">Matutino</option>
            <option value="Vespertino">Vespertino</option>
            <option value="Noturno">Noturno</option>
            <option value="EMIEP">EMIEP</option>
          </select>
        </div>

        {/* DATA INÍCIO */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Data Início (Período)
          </label>
          <input
            type="date"
            id="input-filter-datainicio"
            value={filters.dataInicioFiltro}
            onChange={e => handleChange('dataInicioFiltro', e.target.value)}
            className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* DATA TÉRMINO */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Data Término (Período)
          </label>
          <input
            type="date"
            id="input-filter-datatermino"
            value={filters.dataFiltroTermino}
            onChange={e => handleChange('dataFiltroTermino', e.target.value)}
            className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

      </div>

    </div>
  );
};
