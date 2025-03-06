/**
 * Interfaces compartilhadas para autenticação
 */

/**
 * Interface para o payload do token JWT
 */
export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Interface para a resposta de autenticação
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
} 