/**
 * DTO para dados de taxa de prenhez ao longo do tempo
 */
export class PregnancyRateDataDto {
  /**
   * Rótulos para o eixo x (normalmente meses)
   */
  labels: string[];
  
  /**
   * Valores de taxa de prenhez correspondentes aos rótulos
   */
  values: number[];
} 