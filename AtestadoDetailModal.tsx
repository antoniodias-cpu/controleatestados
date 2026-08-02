import React from 'react';
import { TURNOS_15 } from '../data/mockData';
import { Atestado } from '../types';
import { Calendar, Clock, FileText, GraduationCap, User, X } from 'lucide-react';

interface AtestadoDetailModalProps {
  atestado: Atestado | null;
  onClose: () => void;
}

export const AtestadoDetailModal: React.FC<AtestadoDetailModalProps> = ({
  atestado,
  onClose,
}) => {
  if (!atestado) return null;

  const turnoObj = TURNOS_15.find(t => t.id === atestado.turnoId);

  // Calcular dias totais
  const dInicio = new Date(atestado.dataInicio);
  const dTermino = new Date(atestado.dataTermino);
  const diffTime = Math.abs(dTermino.getTime() - dInicio.getTime());
  const totalDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Status vigente
  const todayStr = new Date().toISOString().slice(0, 10);
  const isVigente = atestado.dataInicio <= todayStr && atestado.dataTermino >= todayStr;

  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">Detalhes do Atestado</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-slate-800">
          
          {/* Status Badge */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Situação do Afastamento
            </span>
            {isVigente ? (
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                ● VIGENTE HOJE
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
                CONCLUÍDO / FORA DE VIGÊNCIA
              </span>
            )}
          </div>

          {/* Aluno & Curso */}
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase">Aluno</div>
            <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              {atestado.nomeAluno}
            </div>
            <div className="text-sm font-medium text-slate-600 flex items-center gap-2 pt-0.5">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              {atestado.curso}
            </div>
          </div>

          {/* Turno */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-slate-700 uppercase">Turno e Período de Aula</div>
            <div className="font-semibold text-slate-900">
              {turnoObj ? `${turnoObj.codigo} - ${turnoObj.nome}` : atestado.turnoPeriodo}
            </div>
            <div className="text-slate-500">
              Horário da Turma: {turnoObj?.horarioPadrao || 'N/I'}
            </div>
          </div>

          {/* Datas & Horários */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
              <div className="text-slate-500 font-semibold mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Data de Entrega
              </div>
              <div className="text-sm font-bold text-slate-900">
                {formatDateBR(atestado.dataEntrega)}
              </div>
            </div>

            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <div className="text-slate-500 font-semibold mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" /> Total Afastado
              </div>
              <div className="text-sm font-bold text-indigo-900">
                {totalDias} dia(s)
              </div>
            </div>
          </div>

          {/* Período Detalhado */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-slate-700 uppercase">Período e Horário de Afastamento</div>
            <div className="text-slate-800 font-semibold">
              De {formatDateBR(atestado.dataInicio)} até {formatDateBR(atestado.dataTermino)}
            </div>
            <div className="text-slate-600">
              Horário diário das {atestado.horaInicio} às {atestado.horaTermino}
            </div>
          </div>

          {/* Motivo & CRM */}
          {(atestado.motivo || atestado.crmMedico) && (
            <div className="text-xs space-y-1">
              {atestado.motivo && (
                <div>
                  <span className="font-bold text-slate-700">Motivo / CID:</span>{' '}
                  <span className="text-slate-800 font-medium">{atestado.motivo}</span>
                </div>
              )}
              {atestado.crmMedico && (
                <div>
                  <span className="font-bold text-slate-700">Responsável Médico:</span>{' '}
                  <span className="text-slate-800">{atestado.crmMedico} {atestado.nomeMedico ? `(${atestado.nomeMedico})` : ''}</span>
                </div>
              )}
            </div>
          )}

          {/* Observações */}
          {atestado.observacoes && (
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs">
              <div className="font-bold text-amber-900 mb-0.5">Observações:</div>
              <div className="text-amber-800 leading-relaxed">{atestado.observacoes}</div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
