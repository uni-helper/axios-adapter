import type { UserUnpluginOptions } from './types'
import process from 'node:process'
import { isPackageExists } from 'local-pkg'
import { createUnplugin } from 'unplugin'

export const unplugin = createUnplugin((_options: UserUnpluginOptions = {}) => {
  const hasFormDataPolyfill = isPackageExists('miniprogram-formdata')
  const hasBlobPolyfill = isPackageExists('miniprogram-blob')
  return {
    name: 'unplugin-uni-axios-adapter',
    enforce: 'pre',
    transform(code, id) {
      if (process.env.UNI_PLATFORM?.includes('mp')) {
        if (id.includes('/form-data/lib/browser.js')) {
          return {
            code: code.replace('window', 'globalThis'),
          }
        }
        if (id.includes('/axios/lib/platform/browser/classes/FormData.js')) {
          return {
            code: `${
              hasFormDataPolyfill
                ? 'import FormData from \'miniprogram-formdata\';'
                : 'class FormData {};'
            }\nexport default FormData;`,
          }
        }
        if (id.includes('/axios/lib/platform/browser/classes/Blob.js')) {
          return {
            code: `${
              hasBlobPolyfill
                ? 'import Blob from \'miniprogram-blob\';'
                : 'class Blob {};'
            }\nexport default Blob;`,
          }
        }
      }
    },
  }
})
