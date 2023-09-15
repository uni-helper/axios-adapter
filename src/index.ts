import { Axios, AxiosAdapter, AxiosRequestConfig } from "axios";
import { getMethod } from "./methods";
import { UserOptions } from "./types";
import { resolveOptions } from "./utils";
export * from './globalExtensions'

export const createUniAppAxiosAdapter = (
  userOptions: UserOptions = {}
): AxiosAdapter => {
  const options = resolveOptions(userOptions);
  Axios.prototype.download = function (url, config) {
    return this.request({
      url,
      method: "download",
      ...config,
    });
  };
  Axios.prototype.upload = function (url, data, config) {
    return this.request({
      url,
      method: "upload",
      data,
      ...config,
    });
  };
  const uniappAdapter: AxiosAdapter = (config: AxiosRequestConfig) => {
    const method = getMethod(config);
    return method(config, options);
  };
  return uniappAdapter;
};
