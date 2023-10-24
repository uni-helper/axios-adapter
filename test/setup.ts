import { vi } from 'vitest'

const uniMock = {
  request: vi.fn(),
  download: vi.fn(),
  upload: vi.fn(),
}

vi.stubGlobal('uni', uniMock)
