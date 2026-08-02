import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Atestado } from '../types';
import { PieChart as PieChartIcon, Clock, Percent } from 'lucide-react';

interface TurnoPieChartProps {
  atestados: Atestado[];
}

const SHIFT_COLORS: Record<string, { bg: string; fill: string; border: string; text: string }> = {
  Matutino: {
    bg: 'bg-amber-50',
    fill: '#f59e0b', // Amber / Sun
    border: 'border-amber-200',
    text: 'text-amber-800',
  },
  Vespertino: {
    bg: 'bg-orange-50',
    fill: '#f97316', // Orange / Afternoon
    border: 'border-orange-200',
    text: 'text-orange-800',
  },
  Noturno: {
    bg: 'bg-indigo-50',
    fill: '#6366f1', // Indigo / Night
    border: 'border-indigo-200',
    text: 'text-indigo-800',
  },
  EMIEP: {
    bg: 'bg-emerald-50',
    fill: '#10b981', // Emerald
    border: 'border-emerald-200',
    text: 'text-emerald-800',
  },
  Outros: {
    bg: 'bg-slate-50',
    fill: '#64748b', // Slate
    border: 'border-slate-200',
    text: 'text-slate-800',
  },
};

export const TurnoPieChart: React.FC<TurnoPieChartProps> = ({ atestados }) => {
  const total = atestados.length;

  // Agrupamento por Turno / Período
  const shiftCounts: Record<string, number> = {};

  atestados.forEach(item => {
    const key = item.turnoPeriodo || 'Outros';
    shiftCounts[key] = (shiftCounts[key] || 0) + 1;
  });

  // Garantir ordem padronizada para Matutino, Vespertino, Noturno
  const standardShifts = ['Matutino', 'Vespertino', 'Noturno'];
  const allShifts = Array.from(new Set([...standardShifts, ...Object.keys(shiftCounts)]));

  const chartData = allShifts
    .map(shift => {
      const count = shiftCounts[shift] || 0;
      const percentage = total > 0 ? (count / total) * 100 : 0;
      return {
        name: shift,
        value: count,
        percentage: Number(percentage.toFixed(1)),
        color: SHIFT_COLORS[shift]?.fill || SHIFT_COLORS.Outros.fill,
      };
    })
    .filter(item => total > 0 ? true : item.value > 0);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (!percent || percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[11px] font-extrabold drop-shadow-md"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div id="turno-pie-chart-container" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 leading-tight">
              Distribuição de Atestados por Turno
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Proporção percentual e volume total de atestados cadastrados
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Total: <strong>{total}</strong> atestado(s)</span>
        </div>
      </div>

      {total === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs font-medium">
          Nenhum atestado cadastrado para exibição no gráfico.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Pie Chart Section */}
          <div className="lg:col-span-6 h-64 sm:h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius="80%"
                  innerRadius="40%"
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                    return [`${value} atestado(s) (${pct}%)`, `Turno ${name}`];
                  }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    color: '#ffffff',
                    fontSize: '12px',
                    padding: '8px 12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                  }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda com Percentuais e Detalhamento */}
          <div className="lg:col-span-6 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5" />
              <span>Legenda e Percentuais</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5">
              {chartData.map(item => {
                const style = SHIFT_COLORS[item.name] || SHIFT_COLORS.Outros;
                return (
                  <div
                    key={item.name}
                    className={`p-3.5 rounded-xl border ${style.border} ${style.bg} flex items-center justify-between transition-all`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <span className={`text-xs font-bold ${style.text} block`}>
                          Turno {item.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {item.value} {item.value === 1 ? 'atestado' : 'atestados'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-black ${style.text} block`}>
                        {item.percentage}%
                      </span>
                      <div className="w-16 bg-slate-200/80 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
