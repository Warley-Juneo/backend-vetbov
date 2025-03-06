export class RecentProtocolDto {
  id: string;
  farm: {
    id: string;
    name: string;
  };
  technician: string;
  animalsCount: number;
  status: string;
  lastUpdate: string;
} 