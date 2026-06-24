import type { AxiosRequestConfig } from 'axios'
import type { Method } from '../types'
import { getMethodType } from '../utils'
import download from './download'
import request from './request'
import upload from './upload'

// 根据请求的 method 字段路由到对应的 uni-app API 实现。
// 'download'/'upload' 是自定义方法名，分别映射到 uni.downloadFile/uni.uploadFile。
export function getMethod(config: AxiosRequestConfig): Method {
  const methodType = getMethodType(config)
  switch (methodType) {
    case 'download':
      return download
    case 'upload':
      return upload
    default:
      return request
  }
}
