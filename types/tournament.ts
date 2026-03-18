export type TournamentCategory = 'major' | 'p1' | 'p2';
export type TournamentStatus = 'upcoming' | 'live' | 'completed';

export interface Tournament {
  id: string;
  name: string;
  location: string;
  country: string;
  category: TournamentCategory;
  status: TournamentStatus;
  startDate: string;
  endDate: string;
  drawSize: number;
  surface: string;
  prizeMoney: string | null;
  imageUrl: string | null;
  createdAt: string;
}
