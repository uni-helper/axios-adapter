import { AxiosResponse, CanceledError } from "axios";
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
      success(result) {
        if (!task) {
          return;
        }
        const response: AxiosResponse = {
          config,
          data: result,
          headers: {},
          status: 200,
          statusText: "OK",
          request: task,
        };
        settle(resolve, reject, response);
        task = null;
      },
      fail(error) {
        reject(error);
      },
      complete() {
        if (config.cancelToken) {
          // @ts-ignore
          config.cancelToken.unsubscribe(onCanceled);
        }

        if (config.signal) {
          config.signal.removeEventListener("abort", onCanceled);
        }
      },
    });

    if (typeof config.onDownloadProgress === "function") {
      task.onProgressUpdate(
        progressEventReducer(config.onDownloadProgress, false)
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
      if (config.signal) {
        config.signal.aborted
          ? onCanceled()
          : config.signal.addEventListener("abort", onCanceled);
      }
    }
  });
};

export default download;
