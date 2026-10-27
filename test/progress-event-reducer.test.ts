import { describe, expect, it, vi } from 'vitest'
import { progressEventReducer } from '../src/utils'

describe('progressEventReducer', () => {
  it('reads upload byte counts from totalBytesSent', () => {
    const listener = vi.fn()
    const push = progressEventReducer(listener)

    push({ progress: 50, totalBytesSent: 50, totalBytesExpectedToSend: 100 })

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      loaded: 50,
      total: 100,
      progress: 0.5,
      bytes: 50,
      upload: true,
      lengthComputable: true,
    }))
  })

  it('reads download byte counts from totalBytesWritten', () => {
    const listener = vi.fn()
    const push = progressEventReducer(listener)

    push({ progress: 25, totalBytesWritten: 25, totalBytesExpectedToWrite: 100 })

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      loaded: 25,
      total: 100,
      progress: 0.25,
      bytes: 25,
      download: true,
      lengthComputable: true,
    }))
  })
})
