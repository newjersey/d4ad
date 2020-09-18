export interface Occupation {
  soc: string;
  title: string;
  majorGroup: string;
}

export interface OccupationDetail {
  soc: string;
  title: string;
  description: string;
  tasks: string[];
  education: string;
  inDemand: boolean;
  medianSalary: number | null;
  openJobsCount: number | null;
}

export interface OccupationDetailPartial {
  soc: string;
  title: string;
  description: string;
  tasks: string[];
}
