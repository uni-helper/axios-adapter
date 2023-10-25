import settle from 'axios/unsafe/core/settle'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AxiosError, AxiosHeaders } from 'axios'
import type { Method } from '../types'
import { resolveUniAppRequestOptions } from '../utils'
import OnCanceled from './onCanceled'

// @ts-expect-error ignore

const upload: Method = (config, options) => {
  return new Promise((resolve, reject) => {
    const requestOptions = resolveUniAppRequestOptions(config, options)
    const responseConfig = config as InternalAxiosRequestConfig
    responseConfig.headers = new AxiosHeaders(requestOptions.header)

    const onCanceled = new OnCanceled(config)

    let task: UniApp.UploadTask | null = uni.uploadFile({
      ...requestOptions,
      success(result) {
        if (!task)
          return

        const response: AxiosResponse = {
          config: responseConfig,
          data: result.data,
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
          const isTimeoutError = errMsg === 'uploadFile:fail timeout'
          const isNetworkError = errMsg === 'uploadFile:fail file error'
          if (isTimeoutError)
            reject(new AxiosError(errMsg, AxiosError.ETIMEDOUT, responseConfig, task))

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
    if (typeof config.onHeadersReceived === 'function')
      task.onHeadersReceived(config.onHeadersReceived)

    onCanceled.subscribe(task, reject)
  })
}

export default upload
