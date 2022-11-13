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
}

export {};
