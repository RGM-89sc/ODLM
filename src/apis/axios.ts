import axios, { AxiosInstance, AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios'
import { Interceptors } from './axios.d'
import { message } from 'antd'

const defaultOptions = {
  timeout: 15000,
  headers: {
    // 'Accept': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json'
  }
}

const defaultInterceptors: Interceptors = {
  request: {
    onFulfilled: (config: AxiosRequestConfig) => {
      // 在发送请求之前做些什么
      return config
    },
    onRejected: (error: AxiosError) => {
      // 对请求错误做些什么
      message.error('请求发送失败！')
      return Promise.reject(error)
    }
  },
  response: {
    onFulfilled: (response: AxiosResponse) => {
      // 对响应数据做点什么
      return response
    },
    onRejected: (error: AxiosError) => {
      // 对响应错误做点什么
      message.error('响应错误！')
      return Promise.reject(error)
    }
  }
}

export default function (options: AxiosRequestConfig = {}, interceptors: Interceptors = { request: {}, response: {} }) {
  const instance: AxiosInstance = axios.create(Object.assign({}, defaultOptions, options))
  
  // 添加请求拦截器
  instance.interceptors
    .request
    .use(interceptors.request.onFulfilled !== undefined ? interceptors.request.onFulfilled : defaultInterceptors.request.onFulfilled, 
      interceptors.request.onRejected !== undefined ? interceptors.request.onRejected : defaultInterceptors.request.onRejected)
  
  // 添加响应拦截器
  instance.interceptors
    .response
    .use(interceptors.response.onFulfilled !== undefined ? interceptors.response.onFulfilled : defaultInterceptors.response.onFulfilled,
      interceptors.response.onRejected !== undefined ? interceptors.response.onRejected : defaultInterceptors.response.onRejected)
  
  return instance
}
