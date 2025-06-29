// @ts-expect-error ignore
import buildURL from 'axios/unsafe/helpers/buildURL'

// @ts-expect-error ignore
import speedometer from 'axios/unsafe/helpers/speedometer'

// @ts-expect-error ignore
import buildFullPath from 'axios/unsafe/core/buildFullPath'

import type { AxiosProgressEvent, AxiosRequestConfig } from 'axios'
import { AxiosHeaders } from 'axios'
import type {
  MethodType,
  ResolvedOptions,
  SerializeOptions,
  UniNetworkRequestWithoutCallback,
  UserOptions,
} from './types'

export function getMethodType<T>(config: AxiosRequestConfig<T>): MethodType {
  const { method: rawMethod = 'GET' } = config
  const method = rawMethod.toLocaleLowerCase()
  switch (method) {
    case 'download':
      return 'download'
    case 'upload':
      return 'upload'
    default:
      return 'request'
  }
}

export function resolveOptions(userOptions: UserOptions): ResolvedOptions {
  return {
    ...userOptions,
  }
}

export function resolveUniAppRequestOptions(config: AxiosRequestConfig, _options: ResolvedOptions): UniNetworkRequestWithoutCallback {
  const data = config.data
  const responseType
    = config.responseType === 'arraybuffer' ? 'arraybuffer' : 'text'
  const dataType = responseType === 'text' ? 'json' : undefined

  const { headers, baseURL, ...requestConfig } = config

  const requestHeaders = AxiosHeaders.from(headers as any).normalize(false)

  if (config.auth) {
    const username = config.auth.username || ''
    const password = config.auth.password
      ? unescape(encodeURIComponent(config.auth.password))
      : ''
    requestHeaders.set(
      'Authorization',
      `Basic ${btoa(`${username}:${password}`)}`,
    )
  }

  const fullPath = buildFullPath(baseURL, config.url)
  const method = (config?.method?.toUpperCase() ?? 'GET') as unknown as any
  const url = buildURL(fullPath, config.params, config.paramsSerializer)

  // set uni-app default value
  // request
  const timeout = config.timeout || 60000
  // upload
  let formData = {}
  if (data && typeof data === 'string') {
    try {
      formData = JSON.parse(data)
    }
    catch (error) {}
  }

  const header = requestHeaders.toJSON()

  return {
    ...requestConfig,
    url,
    data,
    header,
    method,
    responseType,
    dataType,
    timeout,
    formData,
  }
}

// https://github.com/axios/axios/blob/7d45ab2e2ad6e59f5475e39afd4b286b1f393fc0/lib/adapters/xhr.js#L17-L44
export function progressEventReducer(listener: (progressEvent: AxiosProgressEvent) => void, isDownloadStream: boolean) {
  let bytesNotified = 0
  const _speedometer = speedometer(50, 250)

  return (result: UniApp.OnProgressDownloadResult) => {
    const loaded = result.totalBytesWritten
    const total = result.totalBytesExpectedToWrite
    const progressBytes = loaded - bytesNotified
    const rate = _speedometer(progressBytes)
    const inRange = loaded <= total

    bytesNotified = loaded

    const data: AxiosProgressEvent = {
      loaded,
      total,
      progress: total ? loaded / total : undefined,
      bytes: progressBytes,
      rate: rate || undefined,
      estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
      event: result,
    }
    data[isDownloadStream ? 'download' : 'upload'] = true
    listener(data)
  }
}

/**
 * ### 对象序列化
 * - 将一个对象序列化为一个纯净的、类似JSON的新对象。
 * - 此过程会过滤掉值为 null、undefined 或 false 的属性。
 *
 * @link https://github.com/axios/axios/blob/ef36347fb559383b04c755b07f1a8d11897fab7f/lib/core/AxiosHeaders.js#L238-L246
 * @param {Record<string, any> | null | undefined} sourceObj 要进行序列化的源对象。
 * @param {SerializeOptions} [options] 序列化选项。
 * @returns {Record<string, any>} 返回一个新的、纯净的 JavaScript 对象。
 */
export function serializeObject(
  sourceObj: Record<string, any> | null | undefined,
  options?: SerializeOptions,
): Record<string, any> {
  const resultObj: Record<string, any> = Object.create(null)

  if (!sourceObj)
    return resultObj

  const { asStrings = false } = options || {}

  forEach(sourceObj, (value, key) => {
    if (value != null && value !== false) {
      // 如果 asStrings 为 true 且值是数组，则拼接成字符串，否则直接使用原值
      resultObj[key] = asStrings && Array.isArray(value) ? value.join(', ') : value
    }
  })

  return resultObj
}

/**
 * Iterates over an Array, invoking a function for each item.
 *
 * @param {T[]} obj The array to iterate over.
 * @param {(value: T, index: number, array: T[]) => void} fn The callback to invoke for each item.
 * @param {{allOwnKeys?: boolean}} [options] Optional options.
 */
export function forEach<T>(obj: T[], fn: (value: T, index: number, array: T[]) => void, options?: { allOwnKeys?: boolean }): void

/**
 * Iterates over an Object, invoking a function for each item.
 *
 * @param {T} obj The object to iterate over.
 * @param {(value: T[keyof T], key: keyof T, object: T) => void} fn The callback to invoke for each property.
 * @param {{allOwnKeys?: boolean}} [options] Optional options.
 */
export function forEach<T extends object>(obj: T, fn: (value: T[keyof T], key: keyof T, object: T) => void, options?: { allOwnKeys?: boolean }): void

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @link https://github.com/axios/axios/blob/v1.x/lib/utils.js#L240
 *
 * @param {object | Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 * @param {object} [options]
 * @param {boolean} [options.allOwnKeys]
 */
export function forEach(obj: any, fn: Function, { allOwnKeys = false }: { allOwnKeys?: boolean } = {}): void {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined')
    return

  // Force an array if not already something iterable
  if (typeof obj !== 'object')
    obj = [obj]

  if (Array.isArray(obj)) {
    // Iterate over array values
    for (let i = 0, l = obj.length; i < l; i++) {
      // fn(value, index, array)
      fn(obj[i], i, obj)
    }
  }
  else {
    // Iterate over object keys
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj)
    const len = keys.length
    let key

    for (let i = 0; i < len; i++) {
      key = keys[i]
      // fn(value, key, object)
      fn(obj[key], key, obj)
    }
  }
}
