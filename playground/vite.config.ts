import uni from '@dcloudio/vite-plugin-uni'
import uniHelperAxiosAdapter from '@uni-helper/axios-adapter/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni(), uniHelperAxiosAdapter()],
})
