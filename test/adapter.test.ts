import { Buffer } from 'node:buffer'
import axios from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createUniAppAxiosAdapter } from '../src'

const adapter = createUniAppAxiosAdapter()

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
})
