import {
  LocalException,
  NullableOccupationTitle,
  OccupationTitle,
  Program,
  SocDefinition,
} from "./Program";

export interface DataClient {
  findProgramsByIds: (ids: string[]) => Promise<Program[]>;
  findOccupationTitlesByCip: (cip: string) => Promise<OccupationTitle[]>;
  findSocDefinitionBySoc: (soc: string) => Promise<SocDefinition>;
  find2018OccupationTitlesBySoc2010: (soc2010: string) => Promise<OccupationTitle[]>;
  find2010OccupationTitlesBySoc2018: (soc2018: string) => Promise<OccupationTitle[]>;
  getLocalExceptions: () => Promise<LocalException[]>;
  getInDemandOccupationTitles: () => Promise<NullableOccupationTitle[]>;
}
