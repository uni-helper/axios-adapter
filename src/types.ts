import type { AxiosPromise, AxiosRequestConfig } from 'axios'

export interface Options {}

export interface UserOptions extends Partial<Options> {}

export interface ResolvedOptions extends Options {}

export interface UnpluginOptions {}

export interface UserUnpluginOptions extends Partial<UnpluginOptions> {}

export interface ResolvedUnpluginOptions extends UnpluginOptions {}

export type MethodType = 'request' | 'download' | 'upload'

export type Method = (
  config: AxiosRequestConfig,
  options: ResolvedOptions
) => AxiosPromise

export type UniNetworkRequestWithoutCallback = Omit<
  UniApp.RequestOptions,
  'success' | 'fail' | 'complete'
> &
Omit<UniApp.DownloadFileOption, 'success' | 'fail' | 'complete'> &
Omit<UniApp.UploadFileOption, 'success' | 'fail' | 'complete'>
