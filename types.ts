export type UserRole = 'admin' | 'comum';

export interface User {
  id: string;
  nome: string;
  email: string;
  password?: string;
  role: UserRole;
  dataCriacao: string;
}

export type TurnoPeriodo = 'Matutino' | 'Vespertino' | 'Noturno' | 'EMIEP';

export interface TurnoOption {
  id: string;
  codigo: string;
  nome: string;
  periodo: TurnoPeriodo;
  horarioPadrao: string;
}

export interface Atestado {
  id: string;
  nomeAluno: string;
  curso: string;
  turnoPeriodo: TurnoPeriodo;
  turnoId: string; // Um dos 15 turnos específicos
  dataEntrega: string; // YYYY-MM-DD
  dataInicio: string;  // YYYY-MM-DD
  dataTermino: string; // YYYY-MM-DD
  horaInicio: string;  // HH:mm
  horaTermino: string; // HH:mm
  motivo?: string;
  crmMedico?: string;
  nomeMedico?: string;
  observacoes?: string;
  criadoPor: string;
  dataCriacao: string;
}

export interface FilterState {
  busca: string;
  turnoId: string; // 'todos' ou ID de um dos 15 turnos
  periodo: string; // 'todos', 'Matutino', 'Vespertino', 'Noturno'
  curso: string;   // 'todos' ou nome do curso
  dataInicioFiltro: string;
  dataFiltroTermino: string;
  status: string;  // 'todos', 'vigente', 'concluido'
}
