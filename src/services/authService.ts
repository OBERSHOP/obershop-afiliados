import { apiClient } from '@/lib/apiHandler';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RolePrivileges {
  id: string;
  name: string;
  privileges: {
    id: string;
    teamPrivilege: {
      teamCreate: boolean;
      teamEdit: boolean;
      teamView: boolean;
    };
    paymentPrivilege: {
      paymentCreate: boolean;
      paymentEdit: boolean;
      paymentView: boolean;
    };
    supportPrivilege: {
      supportCreate: boolean;
      supportEdit: boolean;
      supportView: boolean;
    };
  };
  description: string;
}

export const login = async ({ email, password }: LoginPayload) => {
  const response = await apiClient.post('/auth', { email, password });
  return response.data as { sessionId: string };
};

export const validateSessionId = async (sessionId: string) => {
  try {
    console.log('authService: Validando sessionId');
    const response = await apiClient.post('/auth/validate-session-id', null, {
      headers: {
        'Session-Id': sessionId,
      },
    });

    console.log('authService: Resposta da validação:', response.data);
    return response.data as {
      id: string;
      fullName: string;
      role: 'ADMIN' | 'USER';
      roleAccess?: {
        id: string;
        name: string;
      };
    };
  } catch (error) {
    console.error('authService: Erro ao validar sessionId:', error);
    throw error;
  }
};
export const logout = async (sessionId: string) => {
  const response = await apiClient.post('/auth/logout', null, {
    headers: {
      'Session-Id': sessionId,
    },
  });

  return response.data;
};
