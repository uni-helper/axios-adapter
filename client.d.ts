declare module "axios" {
  export interface AxiosRequestConfig {
    dataType?: string;
    sslVerify?: boolean;
    firstIpv4?: boolean;
    filePath?: string;
  }

  export class AxiosStatic {
    download(config?: AxiosRequestConfig): string;
    upload(config?: AxiosRequestConfig): string;
  }
}

export {};
