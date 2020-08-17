import {
  CountyEntity,
  IdCountyEntity,
  IdEntity,
  JoinedEntity,
  OccupationEntity,
  ProgramEntity,
  SocTitleEntity,
} from "./Entities";
import knex from "knex";
import Knex, {PgConnectionConfig} from "knex";
import {Error} from "../../domain/Error";
import {TrainingDataClient} from "../../domain/training/TrainingDataClient";
import {TrainingResult} from "../../domain/search/TrainingResult";
import {CalendarLength} from "../../../../frontend/src/domain/Training";
import {Training} from "../../domain/training/Training";
import {Occupation} from "../../domain/occupations/Occupation";
import {ApprovalStatus} from "../../domain/ApprovalStatus";

const NAN_INDICATOR = "-99999";

export class PostgresDataClient implements TrainingDataClient {
  kdb: Knex;

  constructor(connection: PgConnectionConfig) {
    this.kdb = knex({
      client: "pg",
      connection: connection,
    });
  }

  findAllTrainingResults = async (): Promise<TrainingResult[]> => {
    return this.findTrainingResultsByIds(
      await this.kdb("programs")
        .select("programid")
        .then((data: IdEntity[]) => data.map((it) => it.programid))
    );
  };

  findTrainingResultsByIds = async (ids: string[]): Promise<TrainingResult[]> => {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }

    const joinedEntities: JoinedEntity[] = await this.kdb("programs")
      .select(
        "programs.programid",
        "programs.providerid",
        "programs.officialname",
        "programs.totalcost",
        "programs.calendarlengthid",
        "programs.statusname",
        "outcomes_cip.peremployed2",
        "providers.city",
        "providers.statusname as providerstatus",
        "providers.name as providername",
        "indemandcips.cipcode as indemandcip",
        "onlineprograms.programid as onlineprogram"
      )
      .joinRaw(`join unnest('{${ids.join(",")}}'::varchar[]) WITH ORDINALITY t(programid, ord) USING (programid)`)
      .leftOuterJoin("outcomes_cip", function () {
        this
          .on("outcomes_cip.cipcode", "programs.cipcode")
          .on("outcomes_cip.providerid", "programs.providerid");
      })
      .leftOuterJoin("providers", "providers.providerid", "programs.providerid")
      .leftOuterJoin("indemandcips", "indemandcips.cipcode", "programs.cipcode")
      .leftOuterJoin("onlineprograms", "onlineprograms.programid", "programs.programid")
      .whereIn("programs.programid", ids)
      .orderByRaw("t.ord");

    const localExceptionCounties: IdCountyEntity[] = await this.kdb("programs")
      .select(
        "programid",
        "county"
      )
      .innerJoin("localexceptioncips", "localexceptioncips.cipcode", "programs.cipcode")
      .whereIn("programid", ids);

    const localExceptionCountiesLookup = localExceptionCounties.reduce(
      (result: Record<string, string[]>, item: IdCountyEntity) => ({
        ...result,
        [item.programid]: [...(result[item.programid] || []), item.county],
      }),
      {}
    );

    return Promise.resolve(
      joinedEntities.map((entity) => ({
        id: entity.programid,
        name: entity.officialname,
        totalCost: parseFloat(entity.totalcost),
        percentEmployed: this.formatPercentEmployed(entity.peremployed2),
        status: this.mapStatus(entity.statusname),
        calendarLength:
          entity.calendarlengthid !== null
            ? parseInt(entity.calendarlengthid)
            : CalendarLength.NULL,
        inDemand: entity.indemandcip !== null,
        provider: {
          id: entity.providerid,
          city: entity.city,
          name: entity.providername ? entity.providername : "",
          status: this.mapStatus(entity.providerstatus),
        },
        highlight: "",
        localExceptionCounty: localExceptionCountiesLookup[entity.programid] || [],
        online: !!entity.onlineprogram,
        rank: 0
      }))
    );
  };

  findTrainingById = async (id: string): Promise<Training> => {
    const programEntity: ProgramEntity = await this.kdb("programs")
      .select(
        "programs.programid",
        "programs.providerid",
        "programs.officialname",
        "programs.calendarlengthid",
        "programs.description",
        "programs.cipcode",
        "programs.totalcost",
        "providers.website",
        "providers.name as providername",
        "providers.street1",
        "providers.street2",
        "providers.city",
        "providers.state",
        "providers.zip",
        "indemandcips.cipcode as indemandcip",
        "onlineprograms.programid as onlineprogram",
        "outcomes_cip.peremployed2",
        "outcomes_cip.avgquarterlywage2",
      )
      .leftOuterJoin("providers", "providers.providerid", "programs.providerid")
      .leftOuterJoin("indemandcips", "indemandcips.cipcode", "programs.cipcode")
      .leftOuterJoin("onlineprograms", "onlineprograms.programid", "programs.programid")
      .leftOuterJoin("outcomes_cip", function () {
        this
          .on("outcomes_cip.cipcode", "programs.cipcode")
          .on("outcomes_cip.providerid", "programs.providerid");
      })
      .where("programs.programid", id)
      .first()
      .catch(() => undefined)

    if (!programEntity) {
      return Promise.reject(Error.NOT_FOUND)
    }

    const matchingOccupations: SocTitleEntity[] = await this.kdb("soccipcrosswalk")
      .select("soc2018title")
      .where("cipcode", programEntity.cipcode);

    const localExceptionCounties: CountyEntity[] = await this.kdb("localexceptioncips")
      .select("county")
      .where("cipcode", programEntity.cipcode);

    return Promise.resolve({
      id: programEntity.programid,
      name: programEntity.officialname,
      description: programEntity.description,
      calendarLength:
        programEntity.calendarlengthid !== null
          ? parseInt(programEntity.calendarlengthid)
          : CalendarLength.NULL,
      occupations: matchingOccupations.map((it) => it.soc2018title),
      inDemand: programEntity.indemandcip !== null,
      localExceptionCounty: localExceptionCounties.map((it) => it.county),
      totalCost: parseFloat(programEntity.totalcost),
      online: !!programEntity.onlineprogram,
      percentEmployed: this.formatPercentEmployed(programEntity.peremployed2),
      averageSalary: this.formatAverageSalary(programEntity.avgquarterlywage2),
      provider: {
        id: programEntity.providerid,
        url: programEntity.website ? programEntity.website : "",
        address: {
          street1: programEntity.street1,
          street2: programEntity.street2 ? programEntity.street2 : "",
          city: programEntity.city,
          state: programEntity.state,
          zipCode: programEntity.zip,
        },
      },
    });
  };

  getInDemandOccupations = async (): Promise<Occupation[]> => {
    return this.kdb("indemandsocs")
      .select(
        "soc",
        "socdefinitions.soctitle"
      )
      .innerJoin('socdefinitions', 'socdefinitions.soccode', 'indemandsocs.soc')
      .then((data: OccupationEntity[]) => data.map(entity => ({
        soc: entity.soc,
        title: entity.soctitle
      })))
      .catch((e) => {
        console.log("db error: ", e);
        return Promise.reject();
      });
  };

  private mapStatus = (status: string): ApprovalStatus => {
    switch (status) {
      case "Approved":
        return ApprovalStatus.APPROVED;
      case "Pending":
        return ApprovalStatus.PENDING;
      case "Suspend":
        return ApprovalStatus.SUSPENDED;
      default:
        return ApprovalStatus.UNKNOWN;
    }
  };

  private formatPercentEmployed = (perEmployed: string): number | null => {
    if (perEmployed === null || perEmployed === NAN_INDICATOR) {
      return null;
    }

    return parseFloat(perEmployed);
  };

  private formatAverageSalary = (averageQuarterlyWage: string): number | null => {
    if (averageQuarterlyWage === null || averageQuarterlyWage === NAN_INDICATOR) {
      return null;
    }

    const QUARTERS_IN_A_YEAR = 4;
    return parseFloat(averageQuarterlyWage) * QUARTERS_IN_A_YEAR;
  };

  disconnect = async (): Promise<void> => {
    await this.kdb.destroy();
  }
}
