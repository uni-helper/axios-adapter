// @ts-expect-error ignore
import buildURL from "axios/unsafe/helpers/buildURL";
// @ts-expect-error ignore
import speedometer from 'axios/unsafe/helpers/speedometer'
// @ts-expect-error ignore
import buildFullPath from 'axios/unsafe/core/buildFullPath'

import {
  ResolvedOptions,
  MethodType,
  UserOptions,
  UniNetworkRequestWithoutCallback,
} from "./types";
import axios, {
  AxiosRequestConfig,
  AxiosHeaders as AxiosHeadersType,
} from "axios";

export const getMethodType = <T>(config: AxiosRequestConfig<T>): MethodType => {
  const { method: rawMethod = "GET" } = config;
  const method = rawMethod.toLocaleLowerCase();
  switch (method) {
    case "download":
      return "download";
    case "upload":
      return "upload";
    default:
      return "request";
  }
};

export const resolveOptions = (userOptions: UserOptions): ResolvedOptions => {
  return {
    ...userOptions,
  };
};

export const resolveUniAppRequestOptions = (
  config: AxiosRequestConfig,
  options: ResolvedOptions
): UniNetworkRequestWithoutCallback => {
  const data = config.data;
  const responseType =
    config.responseType === "arraybuffer" ? "arraybuffer" : "text";
  const dataType = responseType === "text" ? "json" : undefined;
  // @ts-ignore
  const requestHeaders: AxiosHeadersType = config.headers;

  if (config.auth) {
    const username = config.auth.username || "";
    const password = config.auth.password
      ? unescape(encodeURIComponent(config.auth.password))
      : "";
    requestHeaders.set(
      "Authorization",
      "Basic " + btoa(username + ":" + password)
    );
  }

  const fullPath = buildFullPath(config.baseURL, config.url);
  const method = (config?.method?.toUpperCase() ?? "GET") as unknown as any;
  const url = buildURL(fullPath, config.params, config.paramsSerializer);

  // set uni-app default value
  // request
  const timeout = config.timeout || 60000;
  const withCredentials = config.withCredentials ?? false;
  const sslVerify = config.sslVerify ?? true;
  const firstIpv4 = config.firstIpv4 ?? false;
  // upload
  let formData = {};
  if (data && typeof data === "string") {
    try {
      formData = JSON.parse(data);
    } catch (error) {}
  }

  const header = requestHeaders.toJSON();

  return {
    ...config,
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
    formData,
  };
};

export const progressEventReducer = (
  listener: any,
  isDownloadStream: boolean
) => {
  let bytesNotified = 0;
  const _speedometer = speedometer(50, 250);

  return (result: UniApp.OnProgressDownloadResult) => {
    const loaded = result.totalBytesWritten;
    const total = result.totalBytesExpectedToWrite;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;

    bytesNotified = loaded;

    const data: any = {
      loaded,
      total,
      progress: total ? loaded / total : undefined,
      bytes: progressBytes,
      rate: rate ? rate : undefined,
      estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
      event: result,
    };
    data[isDownloadStream ? "download" : "upload"] = true;
    listener(data);
  };
};
