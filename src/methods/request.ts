import { AxiosError, AxiosResponse } from "axios";
import { Method } from "../types";
import { resolveUniAppRequestOptions } from "../utils";
// @ts-expect-error ignore
import settle from "axios/unsafe/core/settle";
import OnCanceled from "./onCanceled";

const request: Method = (config, options) => {
  return new Promise((resolve, reject) => {
    const {
      url,
      data,
      header,
      method,
      timeout,
      dataType,
      responseType,
      sslVerify,
      withCredentials,
      firstIpv4,
    } = resolveUniAppRequestOptions(config, options);
    const onCanceled = new OnCanceled(config);
    let task: UniApp.RequestTask | null = uni.request({
      url,
      data,
      header,
      method,
      timeout,
      dataType,
      responseType,
      sslVerify,
      withCredentials,
      firstIpv4,
      success(result) {
        if (!task) {
          return;
        }
        const response: AxiosResponse = {
          config,
          data: result.data,
          headers: result.header,
          status: result.statusCode,
          // @ts-ignore
          statusText: result.errMsg ?? "OK",
          request: task,
          cookies: result.cookies,
        };
        settle(resolve, reject, response);
        task = null;
      },
      fail(error) {
        const { errMsg = "" } = error ?? {};
        if (errMsg) {
          const isTimeoutError = errMsg === "request:fail timeout";
          const isNetworkError = errMsg === "request:fail";
          if (isTimeoutError) {
            reject(new AxiosError(errMsg, AxiosError.ETIMEDOUT, config, task));
          }
          if (isNetworkError) {
            reject(
              new AxiosError(errMsg, AxiosError.ERR_NETWORK, config, task)
            );
          }
        }
        reject(new AxiosError(error.errMsg, undefined, config, task));
        task = null;
      },
      complete() {
        onCanceled.unsubscribe();
      },
    });

    if (typeof config.onHeadersReceived === "function") {
      task.onHeadersReceived(config.onHeadersReceived);
    }

    onCanceled.subscribe(task, reject);
  });
};

export default request;
