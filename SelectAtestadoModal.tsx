import React, { useState } from 'react';
import { Atestado } from '../types';
import { X, Search, Edit3, Trash2, GraduationCap, Calendar } from 'lucide-react';

interface SelectAtestadoModalProps {
  isOpen: boolean;
  mode: 'edit' | 'delete';
  atestados: Atestado[];
  onClose: () => void;
  onSelect: (atestado: Atestado) => void;
}

export const SelectAtestadoModal: React.FC<SelectAtestadoModalProps> = ({
  isOpen,
  mode,
  atestados,
  onClose,
  onSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const filtered = atestados.filter(item => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      item.nomeAluno.toLowerCase().includes(term) ||
      item.curso.toLowerCase().includes(term) ||
      (item.id && item.id.toLowerCase().includes(term))
    );
  });

  const isEditMode = mode === 'edit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between ${
          isEditMode ? 'bg-amber-600' : 'bg-rose-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {isEditMode ? <Edit3 className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">
                {isEditMode ? 'Editar Atestado' : 'Apagar Atestado'}
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                {isEditMode
                  ? 'Selecione o aluno/atestado que deseja alterar'
                  : 'Selecione o aluno/atestado que deseja excluir'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome do aluno ou curso..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Atestados List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Nenhum atestado encontrado para a busca informada.
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="p-3.5 hover:bg-slate-50 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                    <span>{item.nomeAluno}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                      {item.turnoPeriodo}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 truncate">
                      <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
                      {item.curso}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      {formatDateBR(item.dataInicio)} a {formatDateBR(item.dataTermino)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(item);
                    onClose();
                  }}
                  className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isEditMode
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                      : 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                  }`}
                >
                  {isEditMode ? (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Apagar</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
};
