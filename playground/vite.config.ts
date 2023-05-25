import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
    {
      name: "vite-plugin-uni-axios",
      transform(code, id) {
        if (process.env.UNI_PLATFORM?.includes("mp")) {
          if (id.includes("/form-data/lib/browser.js")) {
            return {
              code: code.replace("window", "globalThis"),
            };
          }
          if (id.includes("/axios/lib/platform/browser/classes/FormData.js")) {
            return {
              code: `class FormData {};\nexport default FormData;`,
            };
          }
          if (id.includes("/axios/lib/platform/browser/classes/Blob.js")) {
            return {
              code: `class Blob {};\nexport default Blob;`,
            };
          }
        }
      },
    },
  ],
});
