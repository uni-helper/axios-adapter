import {
  AxiosAdapter,
  AxiosRequestConfig,
  AxiosResponse,
  CanceledError,
} from "axios";
import axios, { AxiosError } from "axios";
// @ts-ignore
import utils from "axios/lib/utils.js";
// @ts-ignore
import buildURL from "axios/lib/helpers/buildURL.js";
// @ts-ignore
import buildFullPath from "axios/lib/core/buildFullPath.js";

import { ResolvedOptions, UserOptions } from "./types";

export const resolveOptions = (userOptions: UserOptions): ResolvedOptions => {
  return { ...userOptions };
};

export const resolveUniAppRequestOptions = <
  T extends string | AnyObject | ArrayBuffer | undefined
>(
  config: AxiosRequestConfig<T>,
  options: ResolvedOptions
): Omit<UniApp.RequestOptions, "success" | "fail" | "complete"> => {
  let data = config.data;
  const responseType =
    config.responseType === "arraybuffer" ? "arraybuffer" : "text";
  const dataType = responseType === "text" ? "json" : undefined;
  const header = config.headers ?? {};

  if (utils.isFormData(data) || data === undefined) {
    delete header["Content-Type"];
  }
  if (config.auth) {
    const username = config.auth.username || "";
    const password = config.auth.password
      ? unescape(encodeURIComponent(config.auth.password))
      : "";
    header.Authorization = "Basic " + btoa(username + ":" + password);
  }

  const fullPath = buildFullPath(config.baseURL, config.url);
  const method = (config?.method?.toUpperCase() ?? "GET") as unknown as any;
  const url = buildURL(fullPath, config.params, config.paramsSerializer);
  const timeout = config.timeout || 60000;

  const withCredentials = config.withCredentials ?? false;
  const sslVerify = config.sslVerify ?? true;
  const firstIpv4 = config.firstIpv4 ?? false;
  return {
    url,
    data,
    header,
    method,
    responseType,
    dataType,
    timeout,
    withCredentials,
    sslVerify,
    firstIpv4,
  };
};

export const createUniAppAxiosAdapter = <
  T extends string | AnyObject | ArrayBuffer | undefined
>(
  userOptions: UserOptions = {}
): AxiosAdapter => {
  const options = resolveOptions(userOptions);
  const uniappAdapter: AxiosAdapter = (config: AxiosRequestConfig<T>) => {
    return new Promise((resolve, reject) => {
      const uniAppRequestOptions = resolveUniAppRequestOptions(config, options);
      let onCanceled: any;
      const requestTask = uni.request({
        ...uniAppRequestOptions,
        success({ data, header, statusCode }) {
          if ([200, 201].includes(statusCode)) {
            const response: AxiosResponse = {
              data,
              config,
              headers: header,
              status: statusCode,
              statusText: "ok",
            };
            if (config.cancelToken) {
              // @ts-ignore
              config.cancelToken.unsubscribe(onCanceled);
            }

            if (config.signal) {
              config.signal.removeEventListener("abort", onCanceled);
            }
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
      if (config.cancelToken || config.signal) {
        onCanceled = (cancel?: any) => {
          if (!requestTask) {
            return;
          }
          reject(
            !cancel || (cancel && cancel.type) ? new CanceledError() : cancel
          );
          requestTask.abort();
        };

        // @ts-ignore
        config.cancelToken && config.cancelToken.subscribe(onCanceled);
        if (config.signal) {
          config.signal.aborted
            ? onCanceled()
            : config.signal.addEventListener("abort", onCanceled);
        }
      }
    });
  };
  return uniappAdapter;
};
