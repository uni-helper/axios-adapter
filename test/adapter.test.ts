import { Buffer } from 'node:buffer'
import axios from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createUniAppAxiosAdapter } from '../src'

const adapter = createUniAppAxiosAdapter()

// 让下一次 uni.request 调用走 fail 回调，模拟各平台上报的错误 payload
function mockRequestFail(payload: unknown) {
  vi.mocked(uni.request).mockImplementationOnce(((options: UniApp.RequestOptions) => {
    setTimeout(() => options.fail?.(payload as any))
    return {
      abort: vi.fn(),
      offHeadersReceived: vi.fn(),
      onHeadersReceived: vi.fn(),
    } as unknown as UniNamespace.RequestTask
  }) as unknown as typeof uni.request)
}

// 让下一次 uni.downloadFile 调用走 fail 回调
function mockDownloadFail(payload: unknown) {
  vi.mocked(uni.downloadFile).mockImplementationOnce(((options: UniApp.DownloadFileOption) => {
    setTimeout(() => options.fail?.(payload as any))
    return {
      abort: vi.fn(),
      offHeadersReceived: vi.fn(),
      onHeadersReceived: vi.fn(),
      onProgressUpdate: vi.fn(),
      offProgressUpdate: vi.fn(),
    } as unknown as UniNamespace.DownloadTask
  }) as unknown as typeof uni.downloadFile)
}

describe('createUniAppAxiosAdapter', () => {
  it('should return a function', () => {
    expect(typeof adapter).toBe('function')
  })
})

describe('axios instance with UniApp adapter', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  const instance = axios.create({
    adapter,
    baseURL: 'https://example.com',
  })

  it('should have download method', () => {
    expect(typeof instance.download).toBe('function')
  })

  it('should have upload method', () => {
    expect(typeof instance.upload).toBe('function')
  })

  it('should make a get request', async () => {
    const response = await instance.get('/get')
    expect(response.status).toBe(200)
    expect(response.data).toMatchInlineSnapshot(`
      {
        "method": "GET",
      }
    `)
  })
  it('should make a post request', async () => {
    const response = await instance.post('/post')
    expect(response.status).toBe(200)
    expect(response.data).toMatchInlineSnapshot(`
      {
        "method": "POST",
      }
    `)
  })
  it('should have uni.request options', async () => {
    await instance.get('/get', {
      enableCache: true,
      enableChunked: true,
      enableCookie: true,
      enableHttp2: true,
      enableHttpDNS: true,
      enableQuic: true,
    })
    expect(uni.request).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://example.com/get',
      method: 'GET',
      enableCache: true,
      enableChunked: true,
      enableCookie: true,
      enableHttp2: true,
      enableHttpDNS: true,
      enableQuic: true,
    }))
  })

  it('should make a download request', async () => {
    const response = await instance.download('https://example.com/download')
    expect(response.status).toBe(200)
    expect(response.data).toBeInstanceOf(Buffer)
  })
  it('should make an upload request', async () => {
    const data = new FormData()
    data.append('file', new Blob(['hello world']))
    const response = await instance.upload('https://example.com/upload', data)
    expect(response.status).toBe(200)
  })

  it('maps a fail status error to error.response and a settle-style code', async () => {
    // uni-app 把 HTTP 错误状态也走 fail 回调，适配器需要补出标准 error.response
    mockRequestFail({ errMsg: 'request:fail http status error', statusCode: 503 })

    const error = await instance.get('/service-unavailable').catch(e => e)

    // 5xx 对应 ERR_BAD_RESPONSE，消息格式与 axios settle 一致
    expect(error.code).toBe('ERR_BAD_RESPONSE')
    expect(error.message).toBe('Request failed with status code 503')
    expect(error.response.status).toBe(503)
  })

  it('lets validateStatus accept a fail status error', async () => {
    mockRequestFail({ errMsg: 'request:fail http status error', statusCode: 503 })

    const response = await instance.get('/service-unavailable', {
      validateStatus: () => true,
    })

    expect(response.status).toBe(503)
  })

  it('does not fake error.response for unknown fail shapes', async () => {
    mockRequestFail({ errMsg: 'request:fail ssl handshake failed', errCode: 12 })

    const error = await instance.get('/bad-tls').catch(e => e)

    expect(error.message).toBe('request:fail ssl handshake failed')
    expect(error.response).toBeUndefined()
  })

  it('maps a download timeout to ETIMEDOUT', async () => {
    mockDownloadFail({ errMsg: 'downloadFile:fail timeout' })

    const error = await instance.download('https://example.com/download').catch(e => e)

    expect(error.code).toBe('ETIMEDOUT')
    expect(error.response).toBeUndefined()
  })

  it('rejects a download fail without an error argument instead of hanging', async () => {
    mockDownloadFail(undefined)

    const error = await instance.download('https://example.com/download').catch(e => e)

    expect(error.isAxiosError).toBe(true)
  })

  it('wires onUploadProgress to the upload task', async () => {
    const onProgressUpdate = vi.fn()
    vi.mocked(uni.uploadFile).mockImplementationOnce(((options: UniApp.UploadFileOption) => {
      setTimeout(() => {
        options.success?.({ statusCode: 200, errMsg: 'OK', data: 'ok' })
      })
      return {
        abort: vi.fn(),
        offHeadersReceived: vi.fn(),
        onHeadersReceived: vi.fn(),
        onProgressUpdate,
        offProgressUpdate: vi.fn(),
      } as unknown as UniNamespace.UploadTask
    }) as unknown as typeof uni.uploadFile)

    await instance.upload('https://example.com/upload', new FormData(), {
      onUploadProgress: () => {},
    })

    expect(onProgressUpdate).toHaveBeenCalledOnce()
  })
})
