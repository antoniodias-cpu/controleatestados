import React from 'react';
import { TURNOS_15 } from '../data/mockData';
import { Atestado, User } from '../types';
import { Calendar, Clock, Eye, Edit3, Trash2, GraduationCap, ArrowUpDown, FileX2 } from 'lucide-react';

interface AtestadoTableProps {
  atestados: Atestado[];
  user: User;
  onView: (atestado: Atestado) => void;
  onEdit: (atestado: Atestado) => void;
  onDeleteRequest: (atestado: Atestado) => void;
}

export const AtestadoTable: React.FC<AtestadoTableProps> = ({
  atestados,
  user,
  onView,
  onEdit,
  onDeleteRequest,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const getTurnoCodeAndName = (turnoId: string, periodo: string) => {
    const found = TURNOS_15.find(t => t.id === turnoId);
    if (found) {
      return { code: found.codigo, name: found.nome, periodo: found.periodo };
    }
    return { code: turnoId || 'TRN', name: periodo, periodo };
  };

  if (atestados.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <FileX2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          Nenhum atestado encontrado
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Tente alterar ou limpar os filtros selecionados para consultar mais registros acadêmicos.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-slate-200 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Aluno / Curso</th>
              <th className="py-3.5 px-4">Turno (15 Turnos)</th>
              <th className="py-3.5 px-4 text-center">Entrega</th>
              <th className="py-3.5 px-4 text-center">Afastamento (Início / Término)</th>
              <th className="py-3.5 px-4 text-center">Horário</th>
              <th className="py-3.5 px-4 text-center">Dias</th>
              <th className="py-3.5 px-4 text-right pr-6">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
            {atestados.map((item) => {
              const isVigente = item.dataInicio <= todayStr && item.dataTermino >= todayStr;
              const turnoInfo = getTurnoCodeAndName(item.turnoId, item.turnoPeriodo);

              // Calcular dias de afastamento
              const dInicio = new Date(item.dataInicio);
              const dTermino = new Date(item.dataTermino);
              const diffTime = Math.abs(dTermino.getTime() - dInicio.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isVigente ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ● Vigente
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Concluído
                      </span>
                    )}
                  </td>

                  {/* Aluno & Curso */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      {item.nomeAluno}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-3 h-3 text-slate-400" />
                      {item.curso}
                    </div>
                  </td>

                  {/* Turno (Código dos 15 Turnos) */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-slate-100 font-mono text-[10px] rounded border border-slate-300 text-slate-700">
                        {turnoInfo.code}
                      </span>
                      <span>{item.turnoPeriodo}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[160px] mt-0.5">
                      {turnoInfo.name}
                    </div>
                  </td>

                  {/* Data Entrega */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap text-slate-600">
                    {formatDateBR(item.dataEntrega)}
                  </td>

                  {/* Afastamento */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="font-semibold text-slate-900">
                      {formatDateBR(item.dataInicio)} à {formatDateBR(item.dataTermino)}
                    </div>
                    {item.motivo && (
                      <div className="text-[10px] text-slate-400 italic truncate max-w-[180px] mx-auto mt-0.5">
                        {item.motivo}
                      </div>
                    )}
                  </td>

                  {/* Horário */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap text-slate-600 font-mono text-[11px]">
                    {item.horaInicio} - {item.horaTermino}
                  </td>

                  {/* Dias */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[11px]">
                      {diffDays}d
                    </span>
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap pr-6">
                    <div className="flex items-center justify-end space-x-1.5">
                      
                      {/* Botão Ver Detalhes (Permitido para todos) */}
                      <button
                        onClick={() => onView(item)}
                        title="Ver detalhes do atestado"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Botões Editar / Apagar (Apenas Admin) */}
                      {user.role === 'admin' && (
                        <>
                          <button
                            onClick={() => onEdit(item)}
                            title="Editar atestado"
                            id={`btn-editar-${item.id}`}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteRequest(item)}
                            title="Apagar atestado"
                            id={`btn-excluir-${item.id}`}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer da Tabela com contador */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>
          Exibindo <strong className="text-slate-800">{atestados.length}</strong> atestado(s) nesta consulta.
        </span>
        <span className="text-[11px]">
          Filtro por 15 turnos e exportação PDF ativos.
        </span>
      </div>

    </div>
  );
};
