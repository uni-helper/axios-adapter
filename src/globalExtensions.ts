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

  // axios 1.19 起 request 的返回类型改为 AxiosResponseResult<T, R, D, P>，
  // 其 R 默认值 AxiosResponseDefault 未导出，无法在此复刻 Promise<R> 的透传写法，
  // 因此直接声明解析后的返回类型（AxiosPromise 即 AxiosResponse<T, D, {}, P>），
  // 泛型顺序与 axios 自带方法一致（T 在前，去掉 R）。
  export interface Axios {
    upload: <T = any, D = any, P = any>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig<D, P>,
    ) => AxiosPromise<T, D, P>

    download: <T = any, D = any, P = any>(
      url: string,
      config?: AxiosRequestConfig<D, P>,
    ) => AxiosPromise<T, D, P>
  }
}

export {}
