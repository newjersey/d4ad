import knex from "knex";
import Knex, {PgConnectionConfig} from "knex";
import {SearchClient, TrainingId} from "../../domain/SearchClient";
import {CareerTrackEntity, HeadlineEntity, SearchEntity} from "./Entities";

export class PostgresSearchClient implements SearchClient {
  kdb: Knex;

  constructor(connection: PgConnectionConfig) {
    this.kdb = knex({
      client: "pg",
      connection: connection,
    });
  }

  search = (searchQuery: string): Promise<TrainingId[]> => {
    return this.kdb("programtokens")
      .select(
        "id",
        this.kdb.raw("ts_rank_cd(tokens, websearch_to_tsquery(?), 1) AS rank", [searchQuery])
      )
      .whereRaw("tokens @@ websearch_to_tsquery(?)", searchQuery)
      .orderBy("rank", "desc")
      .then((data: SearchEntity[]) => data.map((entity) => entity.id.toString()))
      .catch((e) => {
        console.log("db error: ", e);
        return Promise.reject();
      });
  };

  getHighlight = async (id: string, searchQuery: string): Promise<string> => {
    const careerTracksJoined = await this.kdb("soccipcrosswalk")
      .select("soc2018title")
      .whereRaw("soccipcrosswalk.cipcode = (select cipcode from programs where id = ?)", id)
      .then((data: CareerTrackEntity[]) => data.map((it) => it.soc2018title).join(", "))
      .catch((e) => {
        console.log("db error: ", e);
        return Promise.reject();
      });

    return this.kdb("programs")
      .select(
        this.kdb.raw(
          "ts_headline(description, websearch_to_tsquery(?)," +
            "'MaxFragments=1, MaxWords=20, MinWords=1, StartSel=[[, StopSel=]]') as descheadline",
          [searchQuery]
        ),
        this.kdb.raw(
          "ts_headline(?, websearch_to_tsquery(?)," +
            "'MaxFragments=1, MaxWords=20, MinWords=1, StartSel=[[, StopSel=]]') as careerheadline",
          [careerTracksJoined, searchQuery]
        )
      )
      .where("id", id)
      .first()
      .then((data: HeadlineEntity) => {
        if (data.descheadline?.includes("[[")) {
          return data.descheadline;
        } else if (data.careerheadline?.includes("[[")) {
          return "Career track: " + data.careerheadline;
        }
        return "";
      })
      .catch((e) => {
        console.log("db error: ", e);
        return Promise.reject();
      });
  };

  disconnect(): void {
    this.kdb.destroy();
  }
}
