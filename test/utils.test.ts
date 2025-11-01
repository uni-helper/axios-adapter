import { describe, expect, it, vi } from 'vitest'
import { forEach, getMethodType, resolveUniAppRequestOptions, serializeObject } from '../src/utils'

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

describe('forEach', () => {
  it('should iterate over an array, providing value, index, and array to the callback', () => {
    const arr = ['a', 1, true]
    const callback = vi.fn()

    forEach(arr, callback)

    expect(callback).toHaveBeenCalledTimes(3)
    expect(callback).toHaveBeenCalledWith('a', 0, arr)
    expect(callback).toHaveBeenCalledWith(1, 1, arr)
    expect(callback).toHaveBeenCalledWith(true, 2, arr)
  })

  it('should iterate over an object\'s own enumerable properties', () => {
    const obj = { a: 1, b: 2 }
    // 添加一个不可枚举的属性
    Object.defineProperty(obj, 'c', { value: 3, enumerable: false })
    // 添加一个原型链上的属性
    Object.setPrototypeOf(obj, { d: 4 })

    const callback = vi.fn()
    forEach(obj, callback)

    expect(callback).toHaveBeenCalledTimes(2) // 只应调用 2 次
    expect(callback).toHaveBeenCalledWith(1, 'a', obj)
    expect(callback).toHaveBeenCalledWith(2, 'b', obj)
    expect(callback).not.toHaveBeenCalledWith(3, 'c', obj) // 不应包含不可枚举的属性
    expect(callback).not.toHaveBeenCalledWith(4, 'd', obj) // 不应包含原型链上的属性
  })

  it('should iterate over all own properties when allOwnKeys is true', () => {
    const obj = { a: 1 }
    Object.defineProperty(obj, 'b', { value: 2, enumerable: false })
    const callback = vi.fn()

    forEach(obj, callback, { allOwnKeys: true })

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(1, 'a', obj)
    expect(callback).toHaveBeenCalledWith(2, 'b', obj)
  })

  it('should handle non-object values by wrapping them in an array', () => {
    const callback = vi.fn()

    forEach(123, callback)
    expect(callback).toHaveBeenCalledOnce()
    expect(callback).toHaveBeenCalledWith(123, 0, [123])

    callback.mockClear()

    forEach('test', callback)
    expect(callback).toHaveBeenCalledOnce()
    expect(callback).toHaveBeenCalledWith('test', 0, ['test'])
  })

  it('should not call the callback for null or undefined input', () => {
    const callback = vi.fn()

    forEach(null, callback)
    forEach(undefined, callback)

    expect(callback).not.toHaveBeenCalled()
  })
})
