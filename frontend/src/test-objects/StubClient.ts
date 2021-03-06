/* eslint-disable @typescript-eslint/no-explicit-any */

import { Client, Observer } from "../domain/Client";
import { Training, TrainingResult } from "../domain/Training";
import { InDemandOccupation, OccupationDetail } from "../domain/Occupation";
import { SearchArea } from "../filtering/LocationFilter";

export class StubClient implements Client {
  capturedObserver: Observer<any> = {
    onError: () => {},
    onSuccess: () => {},
  };

  capturedQuery: string | undefined = undefined;
  capturedId: string | undefined = undefined;
  capturedSearchArea: SearchArea | undefined = undefined;
  getOccupationsWasCalled = false;
  getZipcodesInRadiusWasCalled = false;

  getTrainingsByQuery(query: string, observer: Observer<TrainingResult[]>): void {
    this.capturedObserver = observer;
    this.capturedQuery = query;
  }

  getTrainingById(id: string, observer: Observer<Training>): void {
    this.capturedObserver = observer;
    this.capturedId = id;
  }

  getInDemandOccupations(observer: Observer<InDemandOccupation[]>): void {
    this.capturedObserver = observer;
    this.getOccupationsWasCalled = true;
  }

  getZipcodesInRadius(searchArea: SearchArea, observer: Observer<string[]>): void {
    this.capturedObserver = observer;
    this.capturedSearchArea = searchArea;
    this.getZipcodesInRadiusWasCalled = true;
  }

  getOccupationDetailBySoc(soc: string, observer: Observer<OccupationDetail>): void {
    this.capturedObserver = observer;
  }
}
