import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import uniHelperAxiosAdapter from "@uni-helper/axios-adapter/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni(), uniHelperAxiosAdapter()],
});
