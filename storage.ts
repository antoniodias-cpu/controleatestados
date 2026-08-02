import { Atestado, User } from '../types';
import { INITIAL_ATESTADOS, INITIAL_USERS } from '../data/mockData';
import {
  saveAtestadoToSupabase,
  deleteAtestadoFromSupabase,
  saveUserToSupabase,
  deleteUserFromSupabase,
  fetchAtestadosFromSupabase,
  fetchUsersFromSupabase
} from '../lib/supabase';

const STORAGE_KEYS = {
  USERS: 'atestados_app_users_v1',
  ATESTADOS: 'atestados_app_list_v1',
  CURRENT_USER: 'atestados_app_current_user_v1',
};

// Users Persistence
export function getUsers(): User[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    let usersList: User[] = [];
    if (!data) {
      usersList = [...INITIAL_USERS];
    } else {
      usersList = JSON.parse(data);
    }

    // Lista de administradores padrão garantidos
    const defaultAdmins: { id: string; nome: string; email: string; password: string }[] = [
      { id: 'user-admin-sed', nome: 'Administrador SED', email: 'admin@profe.sed.sc.gov.br', password: 'admin1234' },
      { id: 'user-priscila', nome: 'Priscila', email: 'priscila@profe.sed.sc.gov.br', password: '1234' },
      { id: 'user-cesar', nome: 'Cesar', email: 'cesar@profe.sed.sc.gov.br', password: '1234' },
      { id: 'user-mariahelena', nome: 'Maria Helena', email: 'mariahelena@profe.sed.sc.gov.br', password: '1234' },
      { id: 'user-joana', nome: 'Joana', email: 'joana@profe.sed.sc.gov.br', password: '1234' },
    ];

    const adminEmails = [
      'admin@profe.sed.sc.gov.br',
      'priscila@profe.sed.sc.gov.br',
      'cesar@profe.sed.sc.gov.br',
      'mariahelena@profe.sed.sc.gov.br',
      'joana@profe.sed.sc.gov.br',
    ];

    defaultAdmins.forEach(defAdmin => {
      const idx = usersList.findIndex(u => u.email.toLowerCase().trim() === defAdmin.email);
      if (idx >= 0) {
        usersList[idx] = {
          ...usersList[idx],
          email: defAdmin.email,
          role: usersList[idx].role || 'admin',
          password: usersList[idx].password || defAdmin.password,
        };
      } else {
        usersList.unshift({
          id: defAdmin.id,
          nome: defAdmin.nome,
          email: defAdmin.email,
          password: defAdmin.password,
          role: 'admin',
          dataCriacao: new Date().toISOString().slice(0, 10),
        });
      }
    });

    // Garantir que a propriedade role seja respeitada
    usersList = usersList.map(u => {
      const emailFmt = u.email.toLowerCase().trim();
      const isDefaultAdmin = adminEmails.includes(emailFmt);
      return {
        ...u,
        role: u.role || (isDefaultAdmin ? ('admin' as const) : ('comum' as const)),
      };
    });

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usersList));
    return usersList;
  } catch (e) {
    console.error('Erro ao ler usuários do storage:', e);
    return INITIAL_USERS;
  }
}

export function saveUser(newUser: User): User[] {
  const users = getUsers();
  const cleanEmail = newUser.email.toLowerCase().trim();
  const adminEmails = [
    'admin@profe.sed.sc.gov.br',
    'priscila@profe.sed.sc.gov.br',
    'cesar@profe.sed.sc.gov.br',
    'mariahelena@profe.sed.sc.gov.br',
    'joana@profe.sed.sc.gov.br',
  ];
  const isAdmin = adminEmails.includes(cleanEmail);

  const userToSave: User = {
    ...newUser,
    email: cleanEmail,
    role: newUser.role || (isAdmin ? 'admin' : 'comum'),
  };

  const index = users.findIndex(u => u.id === userToSave.id || u.email.toLowerCase() === cleanEmail);
  let updated: User[];
  if (index >= 0) {
    updated = [...users];
    updated[index] = { ...updated[index], ...userToSave };
  } else {
    updated = [userToSave, ...users];
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));

  // Sync em segundo plano com Supabase
  saveUserToSupabase(userToSave).catch(err => console.warn('Supabase sync user error:', err));

  return updated;
}

export function deleteUser(userId: string): User[] {
  const users = getUsers();
  const target = users.find(u => u.id === userId);
  const protectedEmails = [
    'admin@profe.sed.sc.gov.br',
    'priscila@profe.sed.sc.gov.br',
    'cesar@profe.sed.sc.gov.br',
    'mariahelena@profe.sed.sc.gov.br',
    'joana@profe.sed.sc.gov.br',
  ];

  if (target && protectedEmails.includes(target.email.toLowerCase().trim())) {
    throw new Error(`O usuário administrador (${target.email}) é protegido e não pode ser excluído.`);
  }
  const updated = users.filter(u => u.id !== userId);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));

  // Sync em segundo plano com Supabase
  deleteUserFromSupabase(userId).catch(err => console.warn('Supabase delete user error:', err));

  return updated;
}

// Current Session Persistence
export function getCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }
}

// Atestados Persistence
export function getAtestados(): Atestado[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ATESTADOS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ATESTADOS, JSON.stringify(INITIAL_ATESTADOS));
      return INITIAL_ATESTADOS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Erro ao ler atestados do storage:', e);
    return INITIAL_ATESTADOS;
  }
}

export function saveAtestado(item: Atestado): Atestado[] {
  const list = getAtestados();
  const index = list.findIndex(a => a.id === item.id);
  let updated: Atestado[];
  if (index >= 0) {
    updated = [...list];
    updated[index] = item;
  } else {
    updated = [item, ...list];
  }
  localStorage.setItem(STORAGE_KEYS.ATESTADOS, JSON.stringify(updated));

  // Sync em segundo plano com Supabase
  saveAtestadoToSupabase(item).catch(err => console.warn('Supabase save atestado error:', err));

  return updated;
}

export function deleteAtestado(id: string): Atestado[] {
  const list = getAtestados();
  const updated = list.filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEYS.ATESTADOS, JSON.stringify(updated));

  // Sync em segundo plano com Supabase
  deleteAtestadoFromSupabase(id).catch(err => console.warn('Supabase delete atestado error:', err));

  return updated;
}

export function resetToInitialData(): Atestado[] {
  localStorage.setItem(STORAGE_KEYS.ATESTADOS, JSON.stringify(INITIAL_ATESTADOS));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));

  // Sincronizar dados iniciais também no Supabase
  INITIAL_ATESTADOS.forEach(a => saveAtestadoToSupabase(a));
  INITIAL_USERS.forEach(u => saveUserToSupabase(u));

  return INITIAL_ATESTADOS;
}

// Função de carregamento inicial/sincronia do Supabase para o app
export async function syncFromSupabase(): Promise<{ atestados: Atestado[] | null; users: User[] | null }> {
  const [cloudAtestados, cloudUsers] = await Promise.all([
    fetchAtestadosFromSupabase(),
    fetchUsersFromSupabase()
  ]);

  if (cloudAtestados && cloudAtestados.length > 0) {
    localStorage.setItem(STORAGE_KEYS.ATESTADOS, JSON.stringify(cloudAtestados));
  }

  if (cloudUsers && cloudUsers.length > 0) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(cloudUsers));
  }

  return { atestados: cloudAtestados, users: cloudUsers };
}

