import axios from 'axios'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, vi } from 'vitest'

const server = setupServer(
  http.get('https://example.com/get', ({ request }) => {
    return HttpResponse.json({
      method: request.method,
    })
  }),
  http.post('https://example.com/post', ({ request }) => {
    return HttpResponse.json({
      method: request.method,
    })
  }),
  http.post('https://example.com/upload', ({ request }) => {
    return HttpResponse.json({
      method: request.method,
    })
  }),
  http.get('https://example.com/download', () => {
    return HttpResponse.arrayBuffer(new ArrayBuffer(3))
  }),
)
server.listen()

afterAll(() => server.close())

afterEach(() => server.resetHandlers())

const uniMock = {
  request: vi.fn(
    (options: UniApp.RequestOptions) => {
      setTimeout(async () => {
        const res = await axios.request({
          url: options.url,
          method: options.method,
          data: options.data,
        })

        options.success?.({
          cookies: [],
          data: res.data,
          header: res.headers,
          statusCode: res.status,
        })
      })
      return {
        abort: vi.fn(),
        offHeadersReceived: vi.fn(),
        onHeadersReceived: vi.fn(),
      } as UniNamespace.RequestTask
    },
  ),
  downloadFile: vi.fn(
    (options: UniApp.DownloadFileOption) => {
      setTimeout(async () => {
        const res = await axios.request({
          url: options.url,
          method: 'get',
          responseType: 'arraybuffer',
        })

        options.success?.({
          statusCode: res.status,
          tempFilePath: res.data,
          errMsg: 'OK',

        })
      })
      return {
        abort: vi.fn(),
        offHeadersReceived: vi.fn(),
        onHeadersReceived: vi.fn(),
        onProgressUpdate: vi.fn(),
        offProgressUpdate: vi.fn(),
      } as UniNamespace.DownloadTask
    },
  ),
  uploadFile: vi.fn(
    (options: UniApp.UploadFileOption) => {
      setTimeout(async () => {
        const res = await axios.request({
          url: options.url,
          method: 'post',
          data: options.formData,
        })

        options.success?.({
          statusCode: res.status,
          errMsg: 'OK',
          data: res.data,
        })
      })
      return {
        abort: vi.fn(),
        offHeadersReceived: vi.fn(),
        onHeadersReceived: vi.fn(),
        onProgressUpdate: vi.fn(),
        offProgressUpdate: vi.fn(),
      } as UniNamespace.UploadTask
    },
  ),
}

vi.stubGlobal('uni', uniMock)
