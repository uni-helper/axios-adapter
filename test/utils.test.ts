import { describe, expect, it } from 'vitest'
import { getMethodType, resolveUniAppRequestOptions } from '../src/utils'

describe('getMethodType', () => {
  it('request', () => {
    expect(getMethodType({})).toBe('request')
  })
  it('download', () => {
    expect(getMethodType({ method: 'download' })).toBe('download')
  })
  it('upload', () => {
    expect(getMethodType({ method: 'upload' })).toBe('upload')
  })
})

describe('resolveUniAppRequestOptions', () => {
  it('default', () => {
    expect(resolveUniAppRequestOptions({}, {})).toMatchInlineSnapshot(`
      {
        "data": undefined,
        "dataType": "json",
        "formData": {},
        "header": {},
        "method": "GET",
        "responseType": "text",
        "timeout": 60000,
        "url": undefined,
      }
    `)
  })
  it('custom config', () => {
    expect(resolveUniAppRequestOptions({
      baseURL: 'https://example.com',
      url: '/axios',
      method: 'post',
      responseType: 'text',
      data: {},
      headers: {
        hello: 'world',
      },
      auth: {
        password: 'pwd',
        username: 'uname',
      },
      timeout: 80000,
    }, {})).toMatchInlineSnapshot(`
      {
        "auth": {
          "password": "pwd",
          "username": "uname",
        },
        "data": {},
        "dataType": "json",
        "formData": {},
        "header": {
          "Authorization": "Basic dW5hbWU6cHdk",
          "hello": "world",
        },
        "method": "POST",
        "responseType": "text",
        "timeout": 80000,
        "url": "https://example.com/axios",
      }
    `)
  })
})
