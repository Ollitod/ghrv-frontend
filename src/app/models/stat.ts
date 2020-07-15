export interface Stat {
  id: string;
  count: number;
  uniques: number;
  repoName: number;
  date: number;
}

export interface StatReduced {
  count: number;
  uniques: number;
  date: number;
}
