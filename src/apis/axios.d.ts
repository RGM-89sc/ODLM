import { AxiosInstance, AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios'

export interface Interceptors {
  request: {
    onFulfilled?: (value: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>
    onRejected?: (error: any) => any
  },
  response: {
    onFulfilled?: (value: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>
    onRejected?: (error: any) => any
  }
}