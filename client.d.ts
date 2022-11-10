declare module "axios" {
  export interface AxiosRequestConfig {
    dataType?: string;
    sslVerify?: boolean;
    firstIpv4?: boolean;
  }
}

export {}