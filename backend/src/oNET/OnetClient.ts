import axios, { AxiosResponse } from "axios";
import {Convert2010SocTo2018Soc, GetOccupationDetailPartial} from "../domain/types";
import {Occupation, OccupationDetailPartial} from "../domain/occupations/Occupation";
import { Error } from "../domain/Error";

interface OnetResponse {
  code: string;
  title: string;
  description: string;
}

interface OnetTaskResponse {
  task: OnetTask[];
}

interface OnetTask {
  name: string;
}

interface OnetRelatedOccupationsResponse {
  occupation: OnetOccupation[];
}

interface OnetOccupation {
  code: string;
}

interface OnetAuth {
  username: string;
  password: string;
}

export const OnetClient = (
  baseUrl: string,
  auth: OnetAuth,
  convert2010SocTo2018Soc: Convert2010SocTo2018Soc,
): GetOccupationDetailPartial => {
  const onetConfig = {
    auth: auth,
    headers: {
      "User-Agent": "nodejs-OnetWebService/1.00 (bot)",
      Accept: "application/json",
    },
    timeout: 10000,
    maxRedirects: 0,
  };

  const getTasks = (soc: string): Promise<string[]> => {
    return axios
      .get(`${baseUrl}/ws/online/occupations/${soc}.00/summary/tasks?display=long`, onetConfig)
      .then((response: AxiosResponse<OnetTaskResponse>): string[] => {
        return response.data.task.map((task: OnetTask): string => task.name);
      })
      .catch(() => {
        return Promise.resolve([]);
      });
  };

  const getRelatedOccupations = (soc: string): Promise<Occupation[]> => {
    return axios
      .get(`${baseUrl}/ws/online/occupations/${soc}.00/details/related_occupations?display=long`, onetConfig)
      .then((response: AxiosResponse<OnetRelatedOccupationsResponse>): Promise<Occupation[]> => {
        return Promise.all(response.data.occupation
          .filter((occupation: OnetOccupation): boolean => occupation.code.split('.')[1] === '00')
          .map((occupation: OnetOccupation): string => occupation.code.split('.')[0])
          .map((soc2010: string): Promise<Occupation> => convert2010SocTo2018Soc(soc2010))
        )
      })
      .catch(() => {
        return Promise.resolve([]);
      });
  };

  return async (soc: string): Promise<OccupationDetailPartial> => {
    return axios
      .get(`${baseUrl}/ws/online/occupations/${soc}.00`, onetConfig)
      .then(async (response: AxiosResponse<OnetResponse>) => {
        const formattedCode = response.data.code.split(".")[0];

        return {
          soc: formattedCode,
          title: response.data.title,
          description: response.data.description,
          tasks: await getTasks(soc),
          relatedOccupations: await getRelatedOccupations(soc)
        };
      })
      .catch(() => {
        return Promise.reject(Error.SYSTEM_ERROR);
      });
  };
};
