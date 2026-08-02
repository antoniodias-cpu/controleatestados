import React, { useEffect, useState } from 'react';
import { CURSOS_DISPONIVEIS, TURNOS_15 } from '../data/mockData';
import { Atestado, TurnoPeriodo, User } from '../types';
import { AlertCircle, Calendar, CheckCircle2, Clock, FileText, Save, Upload, User as UserIcon, X } from 'lucide-react';

interface AtestadoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (atestado: Atestado) => void;
  atestadoParaEditar?: Atestado | null;
  currentUser: User;
}

export const AtestadoFormModal: React.FC<AtestadoFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  atestadoParaEditar,
  currentUser,
}) => {
  const [nomeAluno, setNomeAluno] = useState('');
  const [cursosList, setCursosList] = useState<string[]>(CURSOS_DISPONIVEIS);
  const [curso, setCurso] = useState(CURSOS_DISPONIVEIS[0] || '');
  const [turnoPeriodo, setTurnoPeriodo] = useState<TurnoPeriodo>('Matutino');
  const [turnoId, setTurnoId] = useState('T01');
  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().slice(0, 10));
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 10));
  const [dataTermino, setDataTermino] = useState(new Date().toISOString().slice(0, 10));
  const [horaInicio, setHoraInicio] = useState('07:30');
  const [horaTermino, setHoraTermino] = useState('11:10');
  const [motivo, setMotivo] = useState('');
  const [crmMedico, setCrmMedico] = useState('');
  const [nomeMedico, setNomeMedico] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [formError, setFormError] = useState('');
  const [csvSuccessMsg, setCsvSuccessMsg] = useState('');

  // Sincronizar cursosList com CURSOS_DISPONIVEIS globais
  useEffect(() => {
    setCursosList([...CURSOS_DISPONIVEIS]);
  }, [isOpen]);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      // Separar por linhas, vírgulas, ponto e vírgula
      const rawEntries = text.split(/[\r\n,;]+/);
      const newCourses: string[] = [];

      rawEntries.forEach(entry => {
        const clean = entry.replace(/["']/g, '').trim();
        if (
          clean &&
          !clean.toLowerCase().startsWith('curso') &&
          !clean.toLowerCase().startsWith('codigo') &&
          !clean.toLowerCase().startsWith('nome')
        ) {
          if (!newCourses.includes(clean)) {
            newCourses.push(clean);
          }
        }
      });

      if (newCourses.length > 0) {
        // Atualizar lista local e global
        const updatedList = Array.from(new Set([...cursosList, ...newCourses]));
        setCursosList(updatedList);

        newCourses.forEach(c => {
          if (!CURSOS_DISPONIVEIS.includes(c)) {
            CURSOS_DISPONIVEIS.push(c);
          }
        });

        // Selecionar o primeiro novo curso importado
        setCurso(newCourses[0]);
        setCsvSuccessMsg(`${newCourses.length} novo(s) curso(s) importado(s)!`);
        setTimeout(() => setCsvSuccessMsg(''), 4000);
      } else {
        setFormError('Nenhum curso válido encontrado no arquivo CSV.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Ao alterar o período, atualizar o primeiro turno compatível e horários padrão
  const handlePeriodoChange = (newPeriodo: TurnoPeriodo) => {
    setTurnoPeriodo(newPeriodo);
    const compatíveis = TURNOS_15.filter(t => t.periodo === newPeriodo);
    if (compatíveis.length > 0) {
      setTurnoId(compatíveis[0].id);
    } else {
      setTurnoId(newPeriodo);
    }

    if (newPeriodo === 'Matutino') {
      setHoraInicio('07:30');
      setHoraTermino('11:10');
    } else if (newPeriodo === 'Vespertino') {
      setHoraInicio('13:20');
      setHoraTermino('17:00');
    } else if (newPeriodo === 'Noturno') {
      setHoraInicio('18:50');
      setHoraTermino('22:20');
    } else if (newPeriodo === 'EMIEP') {
      setHoraInicio('07:30');
      setHoraTermino('17:00');
    }
  };

  useEffect(() => {
    if (atestadoParaEditar) {
      setNomeAluno(atestadoParaEditar.nomeAluno || '');
      setCurso(atestadoParaEditar.curso || '');
      setTurnoPeriodo(atestadoParaEditar.turnoPeriodo || 'Matutino');
      setTurnoId(atestadoParaEditar.turnoId || 'T01');
      setDataEntrega(atestadoParaEditar.dataEntrega || new Date().toISOString().slice(0, 10));
      setDataInicio(atestadoParaEditar.dataInicio || new Date().toISOString().slice(0, 10));
      setDataTermino(atestadoParaEditar.dataTermino || new Date().toISOString().slice(0, 10));
      setHoraInicio(atestadoParaEditar.horaInicio || '07:30');
      setHoraTermino(atestadoParaEditar.horaTermino || '11:10');
      setMotivo(atestadoParaEditar.motivo || '');
      setCrmMedico(atestadoParaEditar.crmMedico || '');
      setNomeMedico(atestadoParaEditar.nomeMedico || '');
      setObservacoes(atestadoParaEditar.observacoes || '');
    } else {
      // Limpar formulário para novo
      setNomeAluno('');
      setCurso('');
      setTurnoPeriodo('Matutino');
      setTurnoId('T01');
      const today = new Date().toISOString().slice(0, 10);
      setDataEntrega(today);
      setDataInicio(today);
      setDataTermino(today);
      setHoraInicio('07:30');
      setHoraTermino('11:10');
      setMotivo('');
      setCrmMedico('');
      setNomeMedico('');
      setObservacoes('');
    }
    setFormError('');
  }, [atestadoParaEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (currentUser.role !== 'admin') {
      setFormError('Você não possui permissão de administrador para cadastrar, editar ou atualizar registros.');
      return;
    }

    if (!nomeAluno.trim()) {
      setFormError('Informe o nome do aluno.');
      return;
    }
    if (!curso.trim()) {
      setFormError('Informe o curso do aluno.');
      return;
    }
    if (!dataEntrega || !dataInicio || !dataTermino) {
      setFormError('As datas de entrega, início e término são obrigatórias.');
      return;
    }
    if (dataTermino < dataInicio) {
      setFormError('A data de término não pode ser anterior à data de início.');
      return;
    }
    if (!horaInicio || !horaTermino) {
      setFormError('As horas de início e término são obrigatórias.');
      return;
    }
    if (!motivo.trim()) {
      setFormError('Informe o motivo ou CID médico do atestado.');
      return;
    }

    const novoAtestado: Atestado = {
      id: atestadoParaEditar ? atestadoParaEditar.id : 'atest-' + Date.now(),
      nomeAluno: nomeAluno.trim(),
      curso,
      turnoPeriodo,
      turnoId,
      dataEntrega,
      dataInicio,
      dataTermino,
      horaInicio,
      horaTermino,
      motivo: motivo.trim(),
      crmMedico: '',
      nomeMedico: nomeMedico.trim(),
      observacoes: observacoes.trim(),
      criadoPor: currentUser.email,
      dataCriacao: atestadoParaEditar ? atestadoParaEditar.dataCriacao : new Date().toISOString(),
    };

    onSave(novoAtestado);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold">
              {atestadoParaEditar ? 'Editar Atestado Acadêmico' : 'Cadastrar Novo Atestado'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Dados do Aluno e Curso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome do Aluno *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  id="input-form-nomealuno"
                  value={nomeAluno}
                  onChange={e => setNomeAluno(e.target.value)}
                  placeholder="Nome completo do aluno"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Curso *
              </label>
              <select
                required
                id="select-form-curso"
                value={curso}
                onChange={e => setCurso(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Selecione o Curso --</option>
                {cursosList.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Botão para upload de arquivo CSV contendo mais cursos (posicionado logo abaixo) */}
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <input
                  type="file"
                  id="csv-curso-upload-input"
                  accept=".csv, .txt"
                  className="hidden"
                  onChange={handleCsvUpload}
                />
                <label
                  htmlFor="csv-curso-upload-input"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-2xs"
                  title="Importar lista de cursos via arquivo CSV"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Upload CSV de Cursos</span>
                </label>
                {csvSuccessMsg && (
                  <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-1 animate-fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {csvSuccessMsg}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Turno da Aula (Matutino, Vespertino, Noturno, EMIEP) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Turno de Aula *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Matutino', 'Vespertino', 'Noturno', 'EMIEP'] as TurnoPeriodo[]).map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => handlePeriodoChange(p)}
                  className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                    turnoPeriodo === p
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Datas: Entrega, Início, Término */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Data de Entrega *
              </label>
              <input
                type="date"
                required
                id="input-form-dataentrega"
                value={dataEntrega}
                onChange={e => setDataEntrega(e.target.value)}
                className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Data de Início *
              </label>
              <input
                type="date"
                required
                id="input-form-datainicio"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
                className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Data de Término *
              </label>
              <input
                type="date"
                required
                id="input-form-datatermino"
                value={dataTermino}
                onChange={e => setDataTermino(e.target.value)}
                className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Horários: Hora Início e Hora Término */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Hora de Início *
              </label>
              <input
                type="time"
                required
                id="input-form-horainicio"
                value={horaInicio}
                onChange={e => setHoraInicio(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Hora de Término *
              </label>
              <input
                type="time"
                required
                id="input-form-horatermino"
                value={horaTermino}
                onChange={e => setHoraTermino(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Motivo / CID Médico */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Motivo / CID Médico *
            </label>
            <input
              type="text"
              required
              id="input-form-motivo"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Ex: Quadro Gripal / CID J11"
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Observações adicionais */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Observações Institucionais (Opcional)
            </label>
            <textarea
              rows={2}
              id="textarea-form-observacoes"
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Anotações de protocolo, comprovantes recebidos, etc."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              id="btn-form-salvar"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{atestadoParaEditar ? 'Salvar Alterações' : 'Cadastrar Atestado'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
