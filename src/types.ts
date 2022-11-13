import { AxiosRequestConfig, AxiosPromise } from "axios";

export interface Options {}

export interface UserOptions extends Partial<Options> {}

export interface ResolvedOptions extends Options {}

export type MethodType = "request" | "download" | "upload";

export type Method = (
  config: AxiosRequestConfig,
  options: ResolvedOptions
) => AxiosPromise;

export type UniNetworkRequestWithoutCallback = Omit<
  UniApp.RequestOptions,
  "success" | "fail" | "complete"
> &
  Omit<UniApp.DownloadFileOption, "success" | "fail" | "complete"> &
  Omit<UniApp.UploadFileOption, "success" | "fail" | "complete">;
