import {GetOpenJobsCount} from "../domain/types";
import axios, { AxiosResponse } from "axios";

interface CareerOneStopJobsResponse {
  Jobcount: number
}

export const CareerOneStopClient = (baseUrl: string, userId: string, authToken: string): GetOpenJobsCount => {
  return async (soc: string): Promise<number> => {
    return axios
      .get(`${baseUrl}/v1/jobsearch/${userId}/${soc}.00/NJ/1000/0`, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${authToken}`
        }
      })
      .then((response: AxiosResponse<CareerOneStopJobsResponse>) => {
        return response.data.Jobcount;
      })
      .catch((e) => {
        console.log(e)
        return -1
      })
  }
}