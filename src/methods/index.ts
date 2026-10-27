import type { AxiosRequestConfig } from 'axios'
import type { Method } from '../types'
import { getMethodType } from '../utils'
import uniAppDownload from './download'
import uniAppRequest from './request'
import uniAppUpload from './upload'

// 根据请求的 method 字段路由到对应的 uni-app API 实现。
// 'download'/'upload' 是自定义方法名，分别映射到 uni.downloadFile/uni.uploadFile。
// 名字都带 uniApp 前缀：打包后这些实现会变成 dist 的顶层声明，
// 小程序的脚本共享同一个全局词法作用域，upload/download/request 这类名字会被应用代码抢占，
// 导致 dev 构建报 "Identifier 'upload' has already been declared"。
export function getUniAppMethod(config: AxiosRequestConfig): Method {
  const methodType = getMethodType(config)
  switch (methodType) {
    case 'download':
      return uniAppDownload
    case 'upload':
      return uniAppUpload
    default:
      return uniAppRequest
  }
}
