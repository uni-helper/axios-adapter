import { AxiosAdapter, AxiosRequestConfig } from "axios";
import { getMethod } from "./methods";
import { UserOptions } from "./types";
import { resolveOptions } from "./utils";

export const createUniAppAxiosAdapter = <
  D extends string | AnyObject | ArrayBuffer | undefined
>(
  userOptions: UserOptions = {}
): AxiosAdapter => {
  const options = resolveOptions(userOptions);
  const uniappAdapter: AxiosAdapter = (config: AxiosRequestConfig<D>) => {
    const method = getMethod(config);
    return method(config, options);
  };
  return uniappAdapter;
};
