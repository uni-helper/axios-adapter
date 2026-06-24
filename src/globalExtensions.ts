// 扩展 axios 类型定义，使 uni-app 专有参数（如 enableHttp2、enableQuic 等）
// 可直接透传到 AxiosRequestConfig，无需用户自行声明。
// 回调(success/fail/complete)由适配器内部处理，此处通过 Omit 排除。
declare module 'axios' {
  export interface AxiosRequestConfig
    extends Omit<
      UniApp.RequestOptions,
        'success' | 'fail' | 'complete' | 'header'
    >,
    Omit<
      UniApp.UploadFileOption,
        'success' | 'fail' | 'complete' | 'header' | 'formData'
    >,
    Omit<
      UniApp.DownloadFileOption,
        'success' | 'fail' | 'complete' | 'header'
    >,
    Partial<Pick<UniApp.RequestTask, 'onHeadersReceived'>> {}

  export interface AxiosResponse {
    cookies?: string[]
  }

  export interface Axios {
    upload: <T = any, R = AxiosResponse<T>, D = any>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig<D>,
    ) => Promise<R>

    download: <T = any, R = AxiosResponse<T>, D = any>(
      url: string,
      config?: AxiosRequestConfig<D>,
    ) => Promise<R>
  }
}

export {}
