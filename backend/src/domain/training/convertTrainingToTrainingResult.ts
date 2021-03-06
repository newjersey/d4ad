import { Training } from "./Training";
import { TrainingResult } from "../training/TrainingResult";
import { stripUnicode } from "../utils/stripUnicode";

export const convertTrainingToTrainingResult = (
  training: Training,
  highlight: string,
  rank: number
): TrainingResult => {
  return {
    id: training.id,
    name: training.name,
    totalCost: training.totalCost,
    percentEmployed: training.percentEmployed,
    calendarLength: training.calendarLength,
    localExceptionCounty: training.localExceptionCounty,
    online: training.online,
    providerId: training.provider.id,
    providerName: training.provider.name,
    city: training.provider.address.city,
    zipCode: training.provider.address.zipCode,
    county: training.provider.county,
    inDemand: training.inDemand,
    highlight: stripUnicode(highlight),
    rank: rank,
  };
};
