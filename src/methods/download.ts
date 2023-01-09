import { AxiosError, AxiosResponse } from "axios";
import { Method } from "../types";
import { progressEventReducer, resolveUniAppRequestOptions } from "../utils";
import settle from "../axiosLib/core/settle";
import OnCanceled from "./onCanceled";

const download: Method = (config, options) => {
  return new Promise((resolve, reject) => {
    const { url, header, timeout, filePath } = resolveUniAppRequestOptions(
      config,
      options
    );
    const onCanceled = new OnCanceled(config);
    let task: UniApp.DownloadTask | null = uni.downloadFile({
      url,
      header,
      timeout,
      // @ts-ignore
      filePath,
      success(result) {
        if (!task) {
          return;
        }
        const response: AxiosResponse = {
          config,
          data: result.tempFilePath,
          headers: {},
          status: result.statusCode,
          // @ts-ignore
          statusText: result.errMsg ?? "OK",
          request: task,
        };
        settle(resolve, reject, response);
        task = null;
      },
      fail(error) {
        const { errMsg = "" } = error ?? {};
        if (errMsg) {
          const isTimeoutError = errMsg === "downloadFile:fail timeout";
          if (isTimeoutError) {
            reject(new AxiosError(errMsg, AxiosError.ETIMEDOUT, config, task));
          }
          const isNetworkError = errMsg === "downloadFile:fail";
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

    if (typeof config.onDownloadProgress === "function") {
      task.onProgressUpdate(
        progressEventReducer(config.onDownloadProgress, true)
      );
    }

    if (typeof config.onHeadersReceived === "function") {
      task.onHeadersReceived(config.onHeadersReceived);
    }

    onCanceled.subscribe(task, reject);
  });
};

export default download;
