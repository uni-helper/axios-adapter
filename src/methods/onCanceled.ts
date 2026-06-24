import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { CanceledError } from 'axios'

// 统一处理请求取消逻辑，同时兼容两种取消机制：
// - cancelToken（axios 旧版 API，已废弃但仍需支持）
// - AbortController signal（现代标准 API）
// subscribe 在请求发起时调用，unsubscribe 在 complete 回调中调用以清理监听。
export default class OnCanceled<T> {
  config: AxiosRequestConfig<T>
  private onCanceled?: (cancel?: any) => void
  constructor(config: AxiosRequestConfig<T>) {
    this.config = config
  }

  subscribe(task: any, reject: any) {
    if (this.config.cancelToken || this.config.signal) {
      this.onCanceled = (cancel?: any) => {
        if (!task)
          return

        // cancel.type 存在说明是 DOM 事件（signal abort 触发），需包装为 CanceledError；
        // 否则为 cancelToken 直接传入的错误对象，直接 reject。
        reject(
          !cancel || cancel.type
            ? new CanceledError(undefined, undefined, this.config as InternalAxiosRequestConfig, task)
            : cancel,
        )
        task.abort()
        task = null
      }
      if (this.config.cancelToken) {
        // @ts-expect-error ignore
        this.config.cancelToken.subscribe(this.onCanceled)
      }

      // signal 可能在订阅前就已 abort，此时直接触发取消
      if (this.config.signal && this.config.signal.addEventListener) {
        this.config.signal.aborted
          ? this.onCanceled()
          : this.config.signal.addEventListener('abort', this.onCanceled)
      }
    }
  }

  unsubscribe() {
    if (this.config.cancelToken) {
      // @ts-expect-error ignore
      this.config.cancelToken.unsubscribe(this.onCanceled)
    }

    if (this.config.signal && this.config.signal.removeEventListener)
      this.config.signal.removeEventListener('abort', this.onCanceled)
  }
}
