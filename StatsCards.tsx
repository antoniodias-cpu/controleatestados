import React from 'react';
import { Atestado } from '../types';
import { Calendar, CheckCircle, Clock, FileText, GraduationCap } from 'lucide-react';

interface StatsCardsProps {
  atestados: Atestado[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ atestados }) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  // Atestados vigentes hoje
  const vigentes = atestados.filter(a => {
    return a.dataInicio <= todayStr && a.dataTermino >= todayStr;
  });

  // Cursos distintos
  const cursosUnicos = new Set(atestados.map(a => a.curso)).size;

  // Turnos distintos
  const turnosUnicos = new Set(atestados.map(a => a.turnoId)).size;

  // Soma total de dias
  const totalDias = atestados.reduce((acc, curr) => {
    const dInicio = new Date(curr.dataInicio);
    const dTermino = new Date(curr.dataTermino);
    const diffTime = Math.abs(dTermino.getTime() - dInicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return acc + (isNaN(diffDays) ? 1 : diffDays);
  }, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Card 1: Total */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total de Atestados
          </p>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">
            {atestados.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Cadastrados no sistema</p>
        </div>
      </div>

      {/* Card 2: Vigentes */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Em Vigor Hoje
          </p>
          <div className="text-2xl font-bold text-emerald-600 mt-0.5">
            {vigentes.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Alunos afastados atualmente</p>
        </div>
      </div>

      {/* Card 3: Cursos e Turnos */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Cursos Atendidos
          </p>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">
            {cursosUnicos}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{turnosUnicos} turnos contemplados</p>
        </div>
      </div>

      {/* Card 4: Total de Dias */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Dias Abonados
          </p>
          <div className="text-2xl font-bold text-amber-600 mt-0.5">
            {totalDias} <span className="text-sm font-normal text-slate-500">dias</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Soma total de afastamentos</p>
        </div>
      </div>

    </div>
  );
};
