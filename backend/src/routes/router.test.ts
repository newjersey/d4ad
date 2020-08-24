import request from "supertest";
import express, { Express, Router } from "express";
import { routerFactory } from "./router";
import { Error } from "../domain/Error";
import {
  buildOccupation,
  buildTraining,
  buildTrainingResult,
} from "../domain/test-objects/factories";

describe("router", () => {
  let app: Express;
  let router: Router;
  let stubSearchTrainings: jest.Mock;
  let stubFindTrainingsByIds: jest.Mock;
  let stubGetInDemandOccupations: jest.Mock;

  beforeEach(() => {
    stubSearchTrainings = jest.fn();
    stubFindTrainingsByIds = jest.fn();
    stubGetInDemandOccupations = jest.fn();

    router = routerFactory({
      searchTrainings: stubSearchTrainings,
      findTrainingsByIds: stubFindTrainingsByIds,
      getInDemandOccupations: stubGetInDemandOccupations,
    });
    app = express();
    app.use(router);
  });

  describe("/trainings/search", () => {
    it("searches with query and returns list of matching trainings", (done) => {
      const trainings = [buildTrainingResult({}), buildTrainingResult({})];
      stubSearchTrainings.mockImplementationOnce(() => Promise.resolve(trainings));
      request(app)
        .get("/trainings/search?query=penguins")
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual(trainings);
          expect(stubSearchTrainings).toHaveBeenCalledWith("penguins");
          done();
        });
    });

    it("sends a 500 when the search fails", (done) => {
      stubSearchTrainings.mockImplementationOnce(() => Promise.reject());
      request(app).get("/trainings/search?query=badQuery").expect(500).end(done);
    });
  });

  describe("/trainings/{id}", () => {
    it("fetches for first id and returns matching training", (done) => {
      const training = buildTraining({});
      stubFindTrainingsByIds.mockResolvedValue([training]);
      request(app)
        .get("/trainings/12345")
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual(training);
          expect(stubFindTrainingsByIds).toHaveBeenCalledWith(["12345"]);
          done();
        });
    });

    it("sends a 500 when the fetch fails", (done) => {
      stubFindTrainingsByIds.mockImplementationOnce(() => Promise.reject());
      request(app).get("/trainings/systemerror").expect(500).end(done);
    });

    it("sends a 404 when the fetch fails with a Not Found error", (done) => {
      stubFindTrainingsByIds.mockImplementationOnce(() => Promise.reject(Error.NOT_FOUND));
      request(app).get("/trainings/notfounderror").expect(404).end(done);
    });

    it("sends a 404 when the id does not exist", (done) => {
      request(app).get("/trainings/").expect(404).end(done);
    });
  });

  describe("/occupations", () => {
    it("fetches in demand occupations", (done) => {
      const occupations = [buildOccupation({})];
      stubGetInDemandOccupations.mockImplementationOnce(() => Promise.resolve(occupations));
      request(app)
        .get("/occupations")
        .then((response) => {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual(occupations);
          expect(stubGetInDemandOccupations).toHaveBeenCalled();
          done();
        });
    });

    it("sends a 500 when the fetch fails", (done) => {
      stubGetInDemandOccupations.mockImplementationOnce(() => Promise.reject());
      request(app).get("/occupations").expect(500).end(done);
    });
  });
});
