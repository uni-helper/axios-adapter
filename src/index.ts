import type { AxiosAdapter, AxiosRequestConfig } from 'axios'
import type { UserOptions } from './types'
import { Axios } from 'axios'
import { getMethod } from './methods'
import { resolveOptions } from './utils'

export * from './globalExtensions'

// 创建适配器实例。同时在 Axios 原型上挂载 upload/download 方法，
// 使所有 axios 实例均可直接调用 axios.upload() / axios.download()。
// 注意：这是一个全局副作用，多次调用会重复挂载（方法逻辑相同，无实际影响）。
export function createUniAppAxiosAdapter(userOptions: UserOptions = {}): AxiosAdapter {
  const options = resolveOptions(userOptions)
  Axios.prototype.download = function (url, config) {
    return this.request({
      url,
      method: 'download',
      ...config,
    })
  }
  Axios.prototype.upload = function (url, data, config) {
    return this.request({
      url,
      method: 'upload',
      data,
      ...config,
    })
  }
  const uniappAdapter: AxiosAdapter = (config: AxiosRequestConfig) => {
    const method = getMethod(config)
    return method(config, options)
  }
  return uniappAdapter
}
