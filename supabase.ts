import { createClient } from '@supabase/supabase-js';
import { Atestado, User } from '../types';

// Credenciais fornecidas pelo usuário
export const SUPABASE_URL = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || 'https://pwlwkyroyenypzaserfx.supabase.co';
export const SUPABASE_ANON_KEY = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_kqfeJymUahHp6Aex5GXivA_hS3pnit6';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// SQL de inicialização sugerido para o Supabase SQL Editor
export const SUPABASE_SCHEMA_SQL = `-- Script de Criação das Tabelas no Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS atestados (
  id TEXT PRIMARY KEY,
  "nomeAluno" TEXT,
  curso TEXT,
  "turnoPeriodo" TEXT,
  "turnoId" TEXT,
  "dataEntrega" TEXT,
  "dataInicio" TEXT,
  "dataTermino" TEXT,
  "horaInicio" TEXT,
  "horaTermino" TEXT,
  motivo TEXT,
  "crmMedico" TEXT,
  "nomeMedico" TEXT,
  observacoes TEXT,
  "criadoPor" TEXT,
  "dataCriacao" TEXT
);

CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  nome TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT,
  "dataCriacao" TEXT
);

-- Políticas de RLS para acesso anon/public
ALTER TABLE atestados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir acesso completo atestados" ON atestados;
CREATE POLICY "Permitir acesso completo atestados" ON atestados FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir acesso completo usuarios" ON usuarios;
CREATE POLICY "Permitir acesso completo usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);
`;

// Função utilitária para converter registros do Supabase (suporta camelCase e snake_case)
function mapRowToAtestado(row: any): Atestado {
  return {
    id: row.id,
    nomeAluno: row.nomeAluno || row.nome_aluno || '',
    curso: row.curso || '',
    turnoPeriodo: row.turnoPeriodo || row.turno_periodo || 'Matutino',
    turnoId: row.turnoId || row.turno_id || 'T01',
    dataEntrega: row.dataEntrega || row.data_entrega || '',
    dataInicio: row.dataInicio || row.data_inicio || '',
    dataTermino: row.dataTermino || row.data_termino || '',
    horaInicio: row.horaInicio || row.hora_inicio || '',
    horaTermino: row.horaTermino || row.hora_termino || '',
    motivo: row.motivo || '',
    crmMedico: row.crmMedico || row.crm_medico || '',
    nomeMedico: row.nomeMedico || row.nome_medico || '',
    observacoes: row.observacoes || '',
    criadoPor: row.criadoPor || row.criado_por || '',
    dataCriacao: row.dataCriacao || row.data_criacao || new Date().toISOString(),
  };
}

function mapRowToUser(row: any): User {
  return {
    id: row.id,
    nome: row.nome || '',
    email: row.email || '',
    password: row.password || '',
    role: row.role === 'admin' ? 'admin' : 'comum',
    dataCriacao: row.dataCriacao || row.data_criacao || new Date().toISOString().slice(0, 10),
  };
}

// Check de Conexão com Supabase (Valida tabelas atestados e usuarios, e permissões RLS)
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const { error: atestadosErr } = await supabase.from('atestados').select('id').limit(1);
    const { error: usuariosErr } = await supabase.from('usuarios').select('id').limit(1);

    if (atestadosErr && atestadosErr.code === '42P01') {
      return {
        success: false,
        message: 'A tabela "atestados" não foi encontrada no Supabase. Execute o script SQL no painel do Supabase.'
      };
    }

    if (usuariosErr && usuariosErr.code === '42P01') {
      return {
        success: false,
        message: 'A tabela "usuarios" não foi encontrada no Supabase. Execute o script SQL no painel do Supabase.'
      };
    }

    if (atestadosErr) {
      if (atestadosErr.code === '42501' || atestadosErr.message.includes('policy')) {
        return { success: false, message: 'Bloqueio de permissão RLS na tabela "atestados". Verifique se a política RLS FOR ALL foi criada.' };
      }
      return { success: false, message: `Erro na tabela "atestados": ${atestadosErr.message}` };
    }

    if (usuariosErr) {
      if (usuariosErr.code === '42501' || usuariosErr.message.includes('policy')) {
        return { success: false, message: 'Bloqueio de permissão RLS na tabela "usuarios". Verifique se a política RLS FOR ALL foi criada.' };
      }
      return { success: false, message: `Erro na tabela "usuarios": ${usuariosErr.message}` };
    }

    return {
      success: true,
      message: 'Conexão validada! As tabelas "atestados" e "usuarios" estão criadas e acessíveis com as políticas RLS ativas.'
    };
  } catch (err: any) {
    return { success: false, message: `Falha na conexão: ${err.message || 'Erro de rede'}` };
  }
}

// CRUD Atestados via Supabase
export async function fetchAtestadosFromSupabase(): Promise<Atestado[] | null> {
  try {
    const { data, error } = await supabase.from('atestados').select('*').order('dataCriacao', { ascending: false });
    if (error) {
      console.warn('Supabase fetchAtestados warning:', error.message);
      return null;
    }
    return (data || []).map(mapRowToAtestado);
  } catch (err) {
    console.error('Erro ao buscar atestados no Supabase:', err);
    return null;
  }
}

export async function saveAtestadoToSupabase(atestado: Atestado): Promise<boolean> {
  try {
    const payload = {
      id: atestado.id,
      nomeAluno: atestado.nomeAluno,
      curso: atestado.curso,
      turnoPeriodo: atestado.turnoPeriodo,
      turnoId: atestado.turnoId,
      dataEntrega: atestado.dataEntrega,
      dataInicio: atestado.dataInicio,
      dataTermino: atestado.dataTermino,
      horaInicio: atestado.horaInicio,
      horaTermino: atestado.horaTermino,
      motivo: atestado.motivo || '',
      crmMedico: atestado.crmMedico || '',
      nomeMedico: atestado.nomeMedico || '',
      observacoes: atestado.observacoes || '',
      criadoPor: atestado.criadoPor,
      dataCriacao: atestado.dataCriacao,
    };

    const { error } = await supabase.from('atestados').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error('Erro ao salvar no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Erro ao conectar ao Supabase:', err);
    return false;
  }
}

export async function deleteAtestadoFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('atestados').delete().eq('id', id);
    if (error) {
      console.error('Erro ao excluir no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Erro ao excluir atestado no Supabase:', err);
    return false;
  }
}

// CRUD Usuários via Supabase
export async function fetchUsersFromSupabase(): Promise<User[] | null> {
  try {
    const { data, error } = await supabase.from('usuarios').select('*');
    if (error) {
      console.warn('Supabase fetchUsers warning:', error.message);
      return null;
    }
    return (data || []).map(mapRowToUser);
  } catch (err) {
    console.error('Erro ao buscar usuários do Supabase:', err);
    return null;
  }
}

export async function saveUserToSupabase(user: User): Promise<boolean> {
  try {
    const payload = {
      id: user.id,
      nome: user.nome,
      email: user.email.toLowerCase().trim(),
      password: user.password || '',
      role: user.role,
      dataCriacao: user.dataCriacao || new Date().toISOString().slice(0, 10),
    };

    const { error } = await supabase.from('usuarios').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error('Erro ao salvar usuário no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Erro de conexão ao salvar usuário no Supabase:', err);
    return false;
  }
}

export async function deleteUserFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('usuarios').delete().eq('id', id);
    if (error) {
      console.error('Erro ao remover usuário do Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Erro ao deletar usuário no Supabase:', err);
    return false;
  }
}

// Função de Sincronização em Massa (Upload Inicial de Dados Locais para o Supabase)
export async function syncLocalDataToSupabase(localAtestados: Atestado[], localUsers: User[]): Promise<{ atestadosSynced: number; usersSynced: number; errors: string[] }> {
  const errors: string[] = [];
  let atestadosSynced = 0;
  let usersSynced = 0;

  for (const atest of localAtestados) {
    const ok = await saveAtestadoToSupabase(atest);
    if (ok) atestadosSynced++;
    else errors.push(`Falha ao sincronizar atestado ${atest.nomeAluno}`);
  }

  for (const user of localUsers) {
    const ok = await saveUserToSupabase(user);
    if (ok) usersSynced++;
    else errors.push(`Falha ao sincronizar usuário ${user.email}`);
  }

  return { atestadosSynced, usersSynced, errors };
}
