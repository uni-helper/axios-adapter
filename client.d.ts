declare module "axios" {
  export interface AxiosRequestConfig
    extends Omit<
        UniApp.RequestOptions,
        "success" | "fail" | "complete" | "header"
      >,
      Omit<
        UniApp.UploadFileOption,
        "success" | "fail" | "complete" | "header" | "formData"
      >,
      Omit<
        UniApp.DownloadFileOption,
        "success" | "fail" | "complete" | "header"
      >,
      Partial<Pick<UniApp.RequestTask, "onHeadersReceived">> {}

  export interface AxiosResponse {
    cookies?: string[];
  }

  export interface Axios {
    upload<T = any, R = AxiosResponse<T>, D = any>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig<D>
    ): Promise<R>;

    download<T = any, R = AxiosResponse<T>, D = any>(
      url: string,
      config?: AxiosRequestConfig<D>
    ): Promise<R>;
  }
}

export {};
