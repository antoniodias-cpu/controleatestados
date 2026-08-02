import React from 'react';
import { Atestado } from '../types';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  atestado: Atestado | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  atestado,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !atestado) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-200" />
            <h3 className="text-base font-bold">Excluir Atestado</h3>
          </div>
          <button
            onClick={onClose}
            className="text-red-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            Tem certeza de que deseja apagar o atestado do aluno{' '}
            <strong className="text-slate-900 font-bold">{atestado.nomeAluno}</strong>?
          </p>

          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 space-y-1">
            <div><strong className="font-semibold">Curso:</strong> {atestado.curso}</div>
            <div><strong className="font-semibold">Período:</strong> {atestado.dataInicio} a {atestado.dataTermino}</div>
            <div className="pt-1 text-[11px] text-red-600 italic">
              Esta ação não poderá ser desfeita.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          
          <button
            onClick={() => {
              onConfirm(atestado.id);
              onClose();
            }}
            id="btn-confirm-delete"
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Confirmar Exclusão
          </button>
        </div>

      </div>
    </div>
  );
};
