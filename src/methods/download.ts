import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AxiosError, AxiosHeaders } from 'axios'
import settle from 'axios/unsafe/core/settle'
import type { Method } from '../types'
import { progressEventReducer, resolveUniAppRequestOptions } from '../utils'

// @ts-expect-error ignore
import OnCanceled from './onCanceled'

const download: Method = (config, options) => {
  return new Promise((resolve, reject) => {
    const requestOptions = resolveUniAppRequestOptions(
      config,
      options,
    )
    const responseConfig = config as InternalAxiosRequestConfig
    responseConfig.headers = new AxiosHeaders(requestOptions.header)

    const onCanceled = new OnCanceled(config)
    let task: UniApp.DownloadTask | null = uni.downloadFile({
      ...requestOptions,
      success(result) {
        if (!task)
          return

        const response: AxiosResponse = {
          config: responseConfig,
          data: result.tempFilePath,
          headers: {},
          status: result.statusCode,
          statusText: result.errMsg ?? 'OK',
          request: task,
        }
        settle(resolve, reject, response)
        task = null
      },
      fail(error) {
        const { errMsg = '' } = error ?? {}
        if (errMsg) {
          const isTimeoutError = errMsg === 'downloadFile:fail timeout'
          if (isTimeoutError)
            reject(new AxiosError(errMsg, AxiosError.ETIMEDOUT, responseConfig, task))

          const isNetworkError = errMsg === 'downloadFile:fail'
          if (isNetworkError) {
            reject(
              new AxiosError(errMsg, AxiosError.ERR_NETWORK, responseConfig, task),
            )
          }
        }
        reject(new AxiosError(error.errMsg, undefined, responseConfig, task))
        task = null
      },
      complete() {
        onCanceled.unsubscribe()
      },
    })

    if (typeof config.onDownloadProgress === 'function') {
      task.onProgressUpdate(
        progressEventReducer(config.onDownloadProgress, true),
      )
    }

    if (typeof config.onHeadersReceived === 'function')
      task.onHeadersReceived(config.onHeadersReceived)

    onCanceled.subscribe(task, reject)
  })
}

export default download
