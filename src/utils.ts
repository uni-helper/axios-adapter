// @ts-ignore
import utils from "axios/lib/utils.js";
// @ts-ignore
import buildURL from "axios/lib/helpers/buildURL.js";
// @ts-ignore
import buildFullPath from "axios/lib/core/buildFullPath.js";
// @ts-ignore
import speedometer from "axios/lib/helpers/speedometer.js";

import { ResolvedOptions, MethodType, UserOptions } from "./types";
import axios, { AxiosRequestConfig } from "axios";

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
  return { ...userOptions };
};

export const resolveUniAppRequestOptions = (
  config: AxiosRequestConfig,
  options: ResolvedOptions
): Omit<UniApp.RequestOptions, "success" | "fail" | "complete"> &
  Omit<UniApp.DownloadFileOption, "success" | "fail" | "complete"> &
  Omit<UniApp.UploadFileOption, "success" | "fail" | "complete"> => {
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
    filePath: config.filePath,
  };
};

export const progressEventReducer = (
  listener: any,
  isDownloadStream: boolean
) => {
  let bytesNotified = 0;
  const _speedometer = speedometer(50, 250);

  return (e: UniApp.OnProgressDownloadResult) => {
    const loaded = e.totalBytesWritten;
    const total = e.totalBytesExpectedToWrite;
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
      event: e,
    };
    data[isDownloadStream ? "download" : "upload"] = true;
    listener(data);
  };
};
