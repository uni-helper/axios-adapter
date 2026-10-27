import { describe, expect, it } from 'vitest'
import { getMethodType, resolveUniAppRequestOptions, serializeObject } from '../src/utils'

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
        "dataType": undefined,
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
        "dataType": "text",
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

describe('serializeObject', () => {
  it('should filter out null, undefined, and false values', () => {
    const obj = {
      a: 1,
      b: 'hello',
      c: true,
      d: null,
      e: undefined,
      f: false,
      g: 0,
      h: '',
    }
    expect(serializeObject(obj)).toEqual({
      a: 1,
      b: 'hello',
      c: true,
      g: 0,
      h: '',
    })
  })

  it('should handle null or undefined input by returning an empty object', () => {
    expect(serializeObject(null)).toEqual({})
    expect(serializeObject(undefined)).toEqual({})
  })

  it('should handle an empty object input', () => {
    expect(serializeObject({})).toEqual({})
  })

  it('should convert array values to strings if asStrings is true', () => {
    const obj = {
      arr: ['a', 'b', 3],
      str: 'string',
    }
    const result = serializeObject(obj, { asStrings: true })
    expect(result).toEqual({
      arr: 'a, b, 3',
      str: 'string',
    })
  })

  it('should keep array values as arrays if asStrings is false or not provided', () => {
    const obj = {
      arr: ['a', 'b', 3],
    }
    // asStrings 未提供
    expect(serializeObject(obj)).toEqual({
      arr: ['a', 'b', 3],
    })
    // asStrings 为 false
    expect(serializeObject(obj, { asStrings: false })).toEqual({
      arr: ['a', 'b', 3],
    })
  })

  it('should return an object that does not inherit from Object.prototype', () => {
    const result = serializeObject({ a: 1 })
    // 验证对象的原型是 null => Object.create(null) 纯净的对象
    expect(Object.getPrototypeOf(result)).toBeNull()
  })
})
