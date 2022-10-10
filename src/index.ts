import type { AxiosAdapter, AxiosResponse } from "axios";
import { AxiosError } from "axios";

export const uniappAdapter: AxiosAdapter = (config) => {
  const { baseURL = "", url = "", method = "GET" } = config;
  return new Promise((resolve, reject) => {
    uni.request({
      url: baseURL + url,
      method: method.toUpperCase() as UniNamespace.RequestOptions["method"],
      success({ data, header, statusCode }) {
        if ([200, 201].includes(statusCode)) {
          const response: AxiosResponse = {
            data,
            config,
            headers: header,
            status: statusCode,
            statusText: "ok",
          };
          resolve(response);
        } else {
          const error = new AxiosError(
            (data as any).error,
            statusCode as unknown as string,
            config
          );
          reject(error);
        }
      },
      fail(error) {
        reject(error);
      },
    });
  });
};

export default uniappAdapter;
