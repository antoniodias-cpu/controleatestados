import { Atestado, TurnoOption, User } from '../types';

export const TURNOS_15: TurnoOption[] = [
  // Matutino (1-5)
  { id: 'T01', codigo: 'MAT-1', nome: 'Matutino 1 - 1º/2º Semestre', periodo: 'Matutino', horarioPadrao: '07:30 - 11:10' },
  { id: 'T02', codigo: 'MAT-2', nome: 'Matutino 2 - 3º/4º Semestre', periodo: 'Matutino', horarioPadrao: '07:30 - 11:10' },
  { id: 'T03', codigo: 'MAT-3', nome: 'Matutino 3 - 5º/6º Semestre', periodo: 'Matutino', horarioPadrao: '07:30 - 11:10' },
  { id: 'T04', codigo: 'MAT-4', nome: 'Matutino 4 - 7º/8º Semestre', periodo: 'Matutino', horarioPadrao: '07:30 - 11:10' },
  { id: 'T05', codigo: 'MAT-5', nome: 'Matutino Especial / Estágio', periodo: 'Matutino', horarioPadrao: '08:00 - 12:00' },

  // Vespertino (6-10)
  { id: 'T06', codigo: 'VES-1', nome: 'Vespertino 1 - 1º/2º Semestre', periodo: 'Vespertino', horarioPadrao: '13:20 - 17:00' },
  { id: 'T07', codigo: 'VES-2', nome: 'Vespertino 2 - 3º/4º Semestre', periodo: 'Vespertino', horarioPadrao: '13:20 - 17:00' },
  { id: 'T08', codigo: 'VES-3', nome: 'Vespertino 3 - 5º/6º Semestre', periodo: 'Vespertino', horarioPadrao: '13:20 - 17:00' },
  { id: 'T09', codigo: 'VES-4', nome: 'Vespertino 4 - 7º/8º Semestre', periodo: 'Vespertino', horarioPadrao: '13:20 - 17:00' },
  { id: 'T10', codigo: 'VES-5', nome: 'Vespertino Prática Interna', periodo: 'Vespertino', horarioPadrao: '14:00 - 18:00' },

  // Noturno (11-15)
  { id: 'T11', codigo: 'NOT-1', nome: 'Noturno 1 - 1º/2º Semestre', periodo: 'Noturno', horarioPadrao: '18:50 - 22:20' },
  { id: 'T12', codigo: 'NOT-2', nome: 'Noturno 2 - 3º/4º Semestre', periodo: 'Noturno', horarioPadrao: '18:50 - 22:20' },
  { id: 'T13', codigo: 'NOT-3', nome: 'Noturno 3 - 5º/6º Semestre', periodo: 'Noturno', horarioPadrao: '18:50 - 22:20' },
  { id: 'T14', codigo: 'NOT-4', nome: 'Noturno 4 - 7º/8º Semestre', periodo: 'Noturno', horarioPadrao: '18:50 - 22:20' },
  { id: 'T15', codigo: 'NOT-5', nome: 'Noturno Executivo / TCC', periodo: 'Noturno', horarioPadrao: '19:00 - 22:30' },
];

export const CURSOS_DISPONIVEIS = [
  '1MEC1',
  '1MEC2',
  '1MEC3',
  '2MEC1',
  '2MEC2',
  '2MEC3',
  '3MEC1',
  '3MEC2',
  '3MEC3',
  '4MEC1',
  '4MEC2',
  '4MEC3'
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-sed',
    nome: 'Administrador SED',
    email: 'admin@profe.sed.sc.gov.br',
    password: 'admin1234',
    role: 'admin',
    dataCriacao: '2026-01-10'
  },
  {
    id: 'user-priscila',
    nome: 'Priscila',
    email: 'priscila@profe.sed.sc.gov.br',
    password: '1234',
    role: 'admin',
    dataCriacao: '2026-01-10'
  },
  {
    id: 'user-cesar',
    nome: 'Cesar',
    email: 'cesar@profe.sed.sc.gov.br',
    password: '1234',
    role: 'admin',
    dataCriacao: '2026-01-10'
  },
  {
    id: 'user-mariahelena',
    nome: 'Maria Helena',
    email: 'mariahelena@profe.sed.sc.gov.br',
    password: '1234',
    role: 'admin',
    dataCriacao: '2026-01-10'
  },
  {
    id: 'user-joana',
    nome: 'Joana',
    email: 'joana@profe.sed.sc.gov.br',
    password: '1234',
    role: 'admin',
    dataCriacao: '2026-01-10'
  },
  {
    id: 'user-comum-1',
    nome: 'Secretaria Geral (Consulta)',
    email: 'matricula@profe.sed.sc.gov.br',
    password: '1234',
    role: 'comum',
    dataCriacao: '2026-01-15'
  }
];

export const INITIAL_ATESTADOS: Atestado[] = [
  {
    id: 'atest-101',
    nomeAluno: 'Lucas Gabriel Oliveira',
    curso: '1MEC1',
    turnoPeriodo: 'Noturno',
    turnoId: 'T11',
    dataEntrega: '2026-08-01',
    dataInicio: '2026-08-01',
    dataTermino: '2026-08-05',
    horaInicio: '18:50',
    horaTermino: '22:20',
    motivo: 'Gripe Forte e Febre Alta',
    crmMedico: 'CRM-SP 184920',
    nomeMedico: 'Dra. Beatriz Santos',
    observacoes: 'Atestado médico de 5 dias encaminhado via protocolo online.',
    criadoPor: 'admin@profe.sed.sc.gov.br',
    dataCriacao: '2026-08-01T09:30:00Z'
  },
  {
    id: 'atest-102',
    nomeAluno: 'Mariana Costa Rodrigues',
    curso: '2MEC1',
    turnoPeriodo: 'Matutino',
    turnoId: 'T02',
    dataEntrega: '2026-07-28',
    dataInicio: '2026-07-28',
    dataTermino: '2026-07-30',
    horaInicio: '07:30',
    horaTermino: '11:10',
    motivo: 'Procedimento Odontológico de Urgência',
    crmMedico: 'CRO-SP 45210',
    nomeMedico: 'Dr. Roberto Mendonça',
    observacoes: 'Apresentou atestado físico original assinado.',
    criadoPor: 'admin@profe.sed.sc.gov.br',
    dataCriacao: '2026-07-28T14:15:00Z'
  },
  {
    id: 'atest-103',
    nomeAluno: 'Gabriel Henrique Silva',
    curso: '3MEC1',
    turnoPeriodo: 'Noturno',
    turnoId: 'T13',
    dataEntrega: '2026-08-02',
    dataInicio: '2026-08-02',
    dataTermino: '2026-08-04',
    horaInicio: '18:50',
    horaTermino: '22:20',
    motivo: 'Tratamento de Gastroenterite Aguda',
    crmMedico: 'CRM-SP 201394',
    nomeMedico: 'Dr. Fernando Prado',
    observacoes: 'Repouso médico recomendado por 3 dias.',
    criadoPor: 'admin@profe.sed.sc.gov.br',
    dataCriacao: '2026-08-02T08:10:00Z'
  },
  {
    id: 'atest-104',
    nomeAluno: 'Beatriz Lima Fernandes',
    curso: '4MEC1',
    turnoPeriodo: 'Vespertino',
    turnoId: 'T07',
    dataEntrega: '2026-07-25',
    dataInicio: '2026-07-25',
    dataTermino: '2026-07-27',
    horaInicio: '13:20',
    horaTermino: '17:00',
    motivo: 'Consulta e Exames de Rotina Cardiologia',
    crmMedico: 'CRM-SP 119842',
    nomeMedico: 'Dr. Marcelo Camargo',
    observacoes: 'Acompanha comprovante de comparecimento hospitalar.',
    criadoPor: 'admin@profe.sed.sc.gov.br',
    dataCriacao: '2026-07-25T11:00:00Z'
  },
  {
    id: 'atest-105',
    nomeAluno: 'Thiago Alves Martins',
    curso: '1MEC2',
    turnoPeriodo: 'Matutino',
    turnoId: 'T05',
    dataEntrega: '2026-07-30',
    dataInicio: '2026-07-30',
    dataTermino: '2026-08-06',
    horaInicio: '08:00',
    horaTermino: '12:00',
    motivo: 'Cirurgia de Apêndice (Apendicectomia)',
    crmMedico: 'CRM-SP 156321',
    nomeMedico: 'Dr. Carlos Eduardo Moura',
    observacoes: 'Afastamento cirúrgico pós-operatório.',
    criadoPor: 'admin@profe.sed.sc.gov.br',
    dataCriacao: '2026-07-30T16:20:00Z'
  },
  {
    id: 'atest-106',
    nomeAluno: 'Camila Rocha Barbosa',
    curso: '2MEC3',
    turnoPeriodo: 'Vespertino',
    turnoId: 'T08',
    dataEntrega: '2026-08-01',
    dataInicio: '2026-08-01',
    dataTermino: '2026-08-03',
    horaInicio: '13:20',
    horaTermino: '17:00',
    motivo: 'Sintomas de Enxaqueca Severa com Aura',
    crmMedico: 'CRM-SP 210493',
    nomeMedico: 'Dra. Juliana Vasconcelos',
    observacoes: 'Atestado emitido em pronto atendimento.',
    criadoPor: 'admin@escola.edu.br',
    dataCriacao: '2026-08-01T13:40:00Z'
  },
  {
    id: 'atest-107',
    nomeAluno: 'Rafael de Souza Castro',
    curso: 'Administração',
    turnoPeriodo: 'Noturno',
    turnoId: 'T14',
    dataEntrega: '2026-07-20',
    dataInicio: '2026-07-20',
    dataTermino: '2026-07-22',
    horaInicio: '18:50',
    horaTermino: '22:20',
    motivo: 'Torção no Tornozelo Esquerdo',
    crmMedico: 'CRM-SP 177402',
    nomeMedico: 'Dr. Paulo Ricardo Ribeiro',
    observacoes: 'Imobilização prescrita.',
    criadoPor: 'admin@escola.edu.br',
    dataCriacao: '2026-07-20T19:00:00Z'
  },
  {
    id: 'atest-108',
    nomeAluno: 'Juliana Pires Xavier',
    curso: 'Pedagogia',
    turnoPeriodo: 'Matutino',
    turnoId: 'T01',
    dataEntrega: '2026-08-02',
    dataInicio: '2026-08-02',
    dataTermino: '2026-08-02',
    horaInicio: '07:30',
    horaTermino: '11:10',
    motivo: 'Doação de Sangue Voluntária',
    crmMedico: 'HEMOCENTRO-SP',
    nomeMedico: 'Dr. Arnaldo Antunes',
    observacoes: 'Atestado de doação de sangue conforme CLT/Norma Acadêmica.',
    criadoPor: 'admin@escola.edu.br',
    dataCriacao: '2026-08-02T10:00:00Z'
  }
];
