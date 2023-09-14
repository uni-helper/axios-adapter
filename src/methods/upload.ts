import { Method } from "../types";
import { resolveUniAppRequestOptions } from "../utils";
import OnCanceled from "./onCanceled";
// @ts-expect-error ignore
import settle from "axios/unsafe/core/settle";
import { AxiosError, AxiosResponse } from "axios";

const upload: Method = (config, options) => {
  return new Promise((resolve, reject) => {
    const {
      url,
      files,
      fileType,
      file,
      filePath,
      name,
      header,
      timeout,
      formData,
    } = resolveUniAppRequestOptions(config, options);
    const onCanceled = new OnCanceled(config);

    let task: UniApp.UploadTask | null = uni.uploadFile({
      url,
      files,
      fileType,
      file,
      filePath,
      name,
      header,
      timeout,
      formData,
      success(result) {
        if (!task) {
          return;
        }
        const response: AxiosResponse = {
          config,
          data: result.data,
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
          const isTimeoutError = errMsg === "uploadFile:fail timeout";
          const isNetworkError = errMsg === "uploadFile:fail file error";
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

export default upload;
