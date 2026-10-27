import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { Method } from '../types'

import { AxiosError, AxiosHeaders } from 'axios'
// @ts-expect-error ignore
import settle from 'axios/unsafe/core/settle'
import { resolveUniAppRequestOptions } from '../utils'

import OnCanceled from './onCanceled'

const uniAppRequest: Method = (config, options) => {
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
        if (!task)
          return

        // uni-app 的 fail 回调通过 errMsg 区分错误类型，将其映射为 axios 标准错误码
        const failResult = (error ?? {}) as any
        const { errMsg = '' } = failResult

        // uni-app 把 HTTP 错误状态也走 fail 回调：该回调没有成功响应，这里补出
        // response 交给 settle，消息、错误码和 validateStatus 行为与成功路径一致。
        // 具体哪些运行时、哪些 payload 会走这个分支未核实，所以只在 statusCode 存在时接管，
        // 否则交给下面的常规分支。
        if (errMsg === 'request:fail http status error' && failResult.statusCode !== undefined) {
          settle(resolve, reject, {
            config: responseConfig,
            data: failResult.data,
            headers: new AxiosHeaders(failResult.header),
            status: failResult.statusCode,
            statusText: errMsg,
            request: task,
          })
        }
        else if (errMsg === 'request:fail timeout') {
          reject(new AxiosError(errMsg, AxiosError.ETIMEDOUT, responseConfig, task))
        }
        else if (errMsg === 'request:fail') {
          reject(new AxiosError(errMsg, AxiosError.ERR_NETWORK, responseConfig, task))
        }
        else {
          // 未知的 fail 不伪造 error.response：axios 只在服务端真的响应过时提供它
          reject(new AxiosError(errMsg, undefined, responseConfig, task))
        }
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

export default uniAppRequest
