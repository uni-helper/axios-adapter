import { AxiosRequestConfig, AxiosPromise } from "axios";

export interface Options {}

export interface UserOptions extends Partial<Options> {}

export interface ResolvedOptions extends Options {}

export type MethodType = "request" | "download" | "upload";

export type Method = (
  config: AxiosRequestConfig,
  options: UserOptions
) => AxiosPromise;
