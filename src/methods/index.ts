import { AxiosRequestConfig } from "axios";
import { Method } from "../types";
import { getMethodType } from "../utils";
import download from "./download";
import upload from "./upload";
import request from "./request";

export const getMethod = (config: AxiosRequestConfig): Method => {
  const methodType = getMethodType(config);
  switch (methodType) {
    case "download":
      return download;
    case "upload":
      return upload;
    default:
      return request;
  }
};
