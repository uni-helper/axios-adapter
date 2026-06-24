import type { UserUnpluginOptions } from './types'
import process from 'node:process'
import { isPackageExists } from 'local-pkg'
import { createUnplugin } from 'unplugin'

// 构建插件：仅在小程序（mp-*）环境下生效，解决小程序缺少 FormData/Blob 的问题。
// 策略：在构建时替换 axios 内部的 FormData/Blob 引用为小程序 polyfill 或空实现，
// 同时将 form-data 库中的 `window` 替换为 `globalThis`（小程序无 window 对象）。
export const unplugin = createUnplugin((_options: UserUnpluginOptions = {}) => {
  const hasFormDataPolyfill = isPackageExists('miniprogram-formdata')
  const hasBlobPolyfill = isPackageExists('miniprogram-blob')
  return {
    name: 'unplugin-uni-axios-adapter',
    enforce: 'pre',
    transform(code, id) {
      if (process.env.UNI_PLATFORM?.includes('mp')) {
        // form-data 库在 browser.js 中引用 window，小程序环境下需替换为 globalThis
        if (id.includes('/form-data/lib/browser.js')) {
          return {
            code: code.replace('window', 'globalThis'),
          }
        }
        // 替换 axios 内部的 FormData 引用：有 polyfill 则用之，否则提供空 class
        if (id.includes('/axios/lib/platform/browser/classes/FormData.js')) {
          return {
            code: `${
              hasFormDataPolyfill
                ? 'import FormData from \'miniprogram-formdata\';'
                : 'class FormData {};'
            }\nexport default FormData;`,
          }
        }
        // 替换 axios 内部的 Blob 引用：有 polyfill 则用之，否则提供空 class
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
