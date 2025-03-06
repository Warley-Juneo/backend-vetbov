/**
 * Interface para parâmetros de paginação usada em vários repositórios
 */
export interface PaginationParams {
  skip?: number;
  take?: number;
  page?: number;
  limit?: number;
  orderBy?: {
    [key: string]: 'asc' | 'desc';
  };
}

/**
 * Interface para resultado paginado usada em vários repositórios
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
  last_page?: number;
} 