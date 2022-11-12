import { AxiosError, AxiosResponse, CanceledError } from "axios";
import { Method } from "../types";
import { progressEventReducer, resolveUniAppRequestOptions } from "../utils";
// @ts-ignore
import settle from "axios/lib/core/settle";

const download: Method = (config, options) => {
  return new Promise((resolve, reject) => {
    const { url, header, timeout, filePath } = resolveUniAppRequestOptions(
      config,
      options
    );
    let onCanceled: any = null;
    let task: UniApp.DownloadTask | null = null;
    task = uni.downloadFile({
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
          data: result,
          headers: {},
          status: result.statusCode,
          // @ts-ignore
          statusText: result.errMsg,
          request: task,
        };
        settle(resolve, reject, response);
        task = null;
      },
      fail(error) {
        const { errMsg = "" } = error ?? {};
        if (errMsg) {
          const isTimeoutError = errMsg === "downloadFile:fail timeout";
          const isNetworkError = errMsg === "downloadFile:fail";
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
        if (config.cancelToken) {
          // @ts-ignore
          config.cancelToken.unsubscribe(onCanceled);
        }

        if (config.signal && config.signal.removeEventListener) {
          config.signal.removeEventListener("abort", onCanceled);
        }
      },
    });

    if (typeof config.onDownloadProgress === "function") {
      task.onProgressUpdate(
        progressEventReducer(config.onDownloadProgress, true)
      );
    }

    if (config.cancelToken || config.signal) {
      onCanceled = (cancel: any) => {
        if (!task) {
          return;
        }
        reject(
          !cancel || cancel.type
            ? new CanceledError(undefined, undefined, config, task)
            : cancel
        );
        task.abort();
        task = null;
      };
      // @ts-ignore
      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal && config.signal.addEventListener) {
        config.signal.aborted
          ? onCanceled()
          : config.signal.addEventListener("abort", onCanceled);
      }
    }
  });
};

export default download;
