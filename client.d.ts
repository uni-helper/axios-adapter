declare module "axios" {
  export interface AxiosRequestConfig {
    dataType?: string;
    sslVerify?: boolean;
    firstIpv4?: boolean;
    filePath?: string;
    onHeadersReceived?: () => void;
  }

  export interface AxiosResponse {
    cookies?: string[];
  }
}

export {};
