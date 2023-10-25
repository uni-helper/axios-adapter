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
