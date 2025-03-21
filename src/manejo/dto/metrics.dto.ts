export class MetricsDto {
  inseminationCount: number;
  pregnancyRate: number;
  animalsInProtocol: number;
  averageOpenDays: number;
}

export class PregnancyRateDataDto {
  labels: string[];
  values: number[];
} 