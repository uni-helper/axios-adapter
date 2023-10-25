import { afterAll, afterEach, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'
import axios from 'axios'

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
  request: vi.fn<[UniApp.RequestOptions], UniNamespace.RequestTask>(
    (options) => {
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
      }
    },
  ),
  downloadFile: vi.fn<[UniApp.DownloadFileOption], UniNamespace.DownloadTask>(
    (options) => {
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
      }
    },
  ),
  uploadFile: vi.fn<[UniApp.UploadFileOption], UniNamespace.UploadTask>(
    (options) => {
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
      }
    },
  ),
}

vi.stubGlobal('uni', uniMock)
