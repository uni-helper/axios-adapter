import type { AxiosProgressEvent, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

import type {
  MethodType,
  ResolvedOptions,
  SerializeOptions,
  UniNetworkRequestWithoutCallback,
  UserOptions,
} from './types'

import { AxiosError, AxiosHeaders } from 'axios'

// @ts-expect-error ignore
import buildFullPath from 'axios/unsafe/core/buildFullPath'
// @ts-expect-error ignore
import buildURL from 'axios/unsafe/helpers/buildURL'
// @ts-expect-error ignore
import speedometer from 'axios/unsafe/helpers/speedometer'

// 将请求方法分类为三种类型：普通请求、下载、上传。
// 'download' 和 'upload' 是本适配器自定义的方法名，非标准 HTTP 方法。
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

// 把 UTF-8 字符串转成 btoa 可接受的 Latin-1 字节串。
// 与 axios 的 encodeUTF8 一致，替代已废弃的 unescape(encodeURIComponent(...)) 写法。
function encodeUTF8(str: string): string {
  return encodeURIComponent(str).replace(
    /%([0-9A-F]{2})/gi,
    (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)),
  )
}

export function resolveOptions(userOptions: UserOptions): ResolvedOptions {
  return {
    ...userOptions,
  }
}

// 将 axios 的 AxiosRequestConfig 转换为 uni-app API 所需的请求参数格式，
// 处理 header 序列化、Basic Auth、URL 拼接、默认超时等差异。
export function resolveUniAppRequestOptions(config: AxiosRequestConfig, _options: ResolvedOptions): UniNetworkRequestWithoutCallback {
  const data = config.data
  const responseType
    = config.responseType === 'arraybuffer' ? 'arraybuffer' : 'text'
  const dataType = config.responseType

  const { headers, baseURL, ...requestConfig } = config

  const requestHeaders = AxiosHeaders.from(serializeObject(headers)).normalize(false)

  if (config.auth) {
    const username = config.auth.username || ''
    const password = config.auth.password || ''
    // 与 axios 1.21 的 xhr/fetch 保持一致：用户名默认按原字节发送（兼容旧行为），
    // 只有开启 transitional.encodeBasicAuthUsername 才按 UTF-8 编码；密码始终 UTF-8。
    const encodeUsername = config.transitional?.encodeBasicAuthUsername === true
    const encodedUsername = encodeUsername ? encodeUTF8(username) : username
    const encodedPassword = password ? encodeUTF8(password) : ''
    try {
      requestHeaders.set(
        'Authorization',
        `Basic ${btoa(`${encodedUsername}:${encodedPassword}`)}`,
      )
    }
    catch (error) {
      // 用户名超出 Latin-1 且未开启 transitional.encodeBasicAuthUsername 时 btoa 会抛错，
      // 与 axios 一样包装成 AxiosError，调用方才能按 error.code 分类
      throw AxiosError.from(
        error as Error,
        AxiosError.ERR_BAD_OPTION_VALUE,
        config as InternalAxiosRequestConfig,
      )
    }
  }

  // 与 axios 自己的 resolveConfig 一致：allowAbsoluteUrls === false 时
  // 即使 url 是绝对地址也拼到 baseURL 后面
  const fullPath = buildFullPath(baseURL, config.url, config.allowAbsoluteUrls, config)
  const method = (config?.method?.toUpperCase() ?? 'GET') as unknown as any
  const url = buildURL(fullPath, config.params, config.paramsSerializer)

  // uni-app 的 uni.request 默认无超时（等同于无限等待），这里设 60s 作为合理默认值
  const timeout = config.timeout || 60000
  // uni.uploadFile 要求 formData 为对象；当 axios 以 JSON string 传 data 时需尝试解析
  let formData = {}
  if (data && typeof data === 'string') {
    try {
      formData = JSON.parse(data)
    }
    catch {}
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

// 将 uni-app 的 onProgressUpdate 回调适配为 axios 的 AxiosProgressEvent 格式，
// 保持与浏览器端 XHR/fetch 进度事件一致的 API 体验。
// 实现参考 axios XHR adapter 的进度处理逻辑：
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
      lengthComputable: true,
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

  for (const [key, value] of Object.entries(sourceObj)) {
    if (value != null && value !== false) {
      // 如果 asStrings 为 true 且值是数组，则拼接成字符串，否则直接使用原值
      resultObj[key] = asStrings && Array.isArray(value) ? value.join(', ') : value
    }
  }

  return resultObj
}
