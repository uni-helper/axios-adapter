import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { Method } from '../types'

import { AxiosError, AxiosHeaders } from 'axios'
// @ts-expect-error ignore
import settle from 'axios/unsafe/core/settle'
import { resolveUniAppRequestOptions } from '../utils'

import OnCanceled from './onCanceled'

const request: Method = (config, options) => {
  return new Promise((resolve, reject) => {
    const requestOptions = resolveUniAppRequestOptions(config, options)
    const responseConfig = config as InternalAxiosRequestConfig
    responseConfig.headers = new AxiosHeaders(requestOptions.header)

    const onCanceled = new OnCanceled(config)
    // task 设为 null 表示请求已被取消或已完成，后续回调不再处理
    let task: UniApp.RequestTask | null = uni.request({
      ...requestOptions,
      success(result) {
        if (!task)
          return

        // 钉钉小程序安卓端返回的 header 为 [{key: value}, ...] 数组格式，需合并为对象
        if (Array.isArray(result.header)) {
          const dingHeader = {}
          result.header.forEach(h => Object.assign(dingHeader, h))
          result.header = dingHeader
        }

        const headers = new AxiosHeaders(result.header)
        const response: AxiosResponse = {
          config: responseConfig,
          data: result.data,
          headers,
          status: result.statusCode,
          statusText: result.errMsg ?? 'OK',
          request: task,
          cookies: result.cookies,
        }
        settle(resolve, reject, response)
        task = null
      },
      fail(error) {
        // uni-app 的 fail 回调通过 errMsg 区分错误类型，将其映射为 axios 标准错误码
        const { errMsg = '' } = error ?? {}
        if (errMsg) {
          const isStatusError = errMsg === 'request:fail http status error'
          const isTimeoutError = errMsg === 'request:fail timeout'
          const isNetworkError = errMsg === 'request:fail'
          if (isTimeoutError)
            reject(new AxiosError(errMsg, AxiosError.ETIMEDOUT, responseConfig, task))

          if (isNetworkError) {
            reject(
              new AxiosError(errMsg, AxiosError.ERR_NETWORK, responseConfig, task),
            )
          }
          if (isStatusError) {
            const response: any = error ?? {}
            reject(
              new AxiosError(errMsg, response.statusCode, responseConfig, task, response),
            )
          }
        }
        const failResponse = { ...(error as any), status: (error as any)?.statusCode }
        reject(new AxiosError(errMsg, failResponse.status, responseConfig, task, failResponse))
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

export default request
