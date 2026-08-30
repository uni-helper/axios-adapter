import type { AxiosPromise } from 'axios'
import axios from 'axios'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { createUniAppAxiosAdapter } from '../src'

// 锁定 upload/download 的公开类型契约。expectTypeOf 断言由 pnpm typecheck（tsc
// --noEmit，覆盖 test/ 目录）强制执行，vitest 运行时只是空操作。
// 背景：axios 1.19 修改 request 返回类型时曾静默破坏过这两个增强签名，
// 当时只靠 src/index.ts 的原型赋值间接暴露，这里显式钉住消费者视角的类型。
// 泛型行为与 axios 自带方法一致：T 不从实参推断，D/P 显式给出才传递。
const instance = axios.create({ adapter: createUniAppAxiosAdapter() })

describe('upload/download type contract', () => {
  it('download<T> resolves AxiosPromise<T>', async () => {
    const promise = instance.download<{ filePath: string }>('https://example.com/download')
    expectTypeOf(promise).toEqualTypeOf<AxiosPromise<{ filePath: string }>>()
    expect((await promise).status).toBe(200)
  })

  it('upload<T, D> threads explicit D into the response', async () => {
    const promise = instance.upload<{ id: number }, FormData>('https://example.com/upload', new FormData())
    expectTypeOf(promise).toEqualTypeOf<AxiosPromise<{ id: number }, FormData, any>>()
    expect((await promise).status).toBe(200)
  })

  it('config.params threads P through to the response', async () => {
    const promise = instance.download('https://example.com/download', { params: { page: 1 } })
    expectTypeOf(promise).toEqualTypeOf<AxiosPromise<any, any, { page: number }>>()
    expect((await promise).status).toBe(200)
  })
})
