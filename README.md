<img src="./assets/logo.svg" alt="logo of @uni-helper/axios-adapter repository" width="100" height="100" align="right" />

# @uni-helper/axios-adapter

> 适用于 Vue2 和 Vue3 的 uniapp Axios 适配器

## 安装

```
pnpm i @uni-helper/axios-adapter axios
```

## 使用

<details>
<summary>点击查看平台兼容性</summary>

| Vue2 | Vue3 |
| ---- | ---- |
| √    | √    |

| App                                      | 快应用 | 微信小程序 | 支付宝小程序 | 百度小程序 | 字节小程序 | QQ 小程序 |
| ---------------------------------------- | ------ | ---------- | ------------ | ---------- | ---------- | --------- |
| HBuilderX 3.4.8<br/>app-vue<br/>app-nvue | √      | √          | √            | √          | √          | √         |

| 钉钉小程序 | 快手小程序 | 飞书小程序 | 京东小程序 |
| ---------- | ---------- | ---------- | ---------- |
| √          | √          | √          | √          |

| H5-Safari | Android Browser | 微信浏览器(Android) | QQ 浏览器(Android) | Chrome | IE  | Edge | Firefox | PC-Safari |
| --------- | --------------- | ------------------- | ------------------ | ------ | --- | ---- | ------- | --------- |
| √         | √               | √                   | √                  | √      | √   | √    | √       | √         |

</details>

### 基本用法

```ts
import axios from "axios";
import { createUniAppAxiosAdapter } from "@uni-helper/axios-adapter";

axios.defaults.adapter = createUniAppAxiosAdapter();
```

或者创建自定义实例

```ts
import axios from "axios";
import { createUniAppAxiosAdapter } from "@uni-helper/axios-adapter";

const instance = axios.create({ adapter: createUniAppAxiosAdapter() });
```

### 与 [useAxios](https://vueuse.org/integrations/useAxios/) 一起使用

```ts
import axios from "axios";
import { createUniAppAxiosAdapter } from "@uni-helper/axios-adapter";

axios.defaults.adapter = createUniAppAxiosAdapter();
const { data, isFinished } = useAxios("/posts");
```

### 上传和下载

```ts
// 下载
axios.download("/");
// or
axios.request({
  url: "/",
  method: "download",
});

// 上传
axios.upload("/", new File([new Blob()], "fake file"));
// or
axios.request({
  url: "/",
  method: "upload",
  data: new File([new Blob()], "fake file"),
});
```

### 小程序

axios 依赖了 `FormData` 和 `Blob` 对象, 而小程序没有，使用提供的插件来解决这一问题

```ts
// vite.config.js
import uniAxiosAdapter from "@uni-helper/axios-adapter/vite";

export default {
  plugins: [
  ...
  uniAxiosAdapter()
  ...
  ],
}
```

> [!WARNING]
> 这个插件通过将 `FormData` 和 `Blob` 导出为空 `class`来解决兼容性问题，如果你确实需要的话，使用 `pnpm add miniprogram-formdata miniprogram-blob` 来安装对应的 polyfill 即可，插件会自动使用。

如果你使用的是 Vue CLI，改用 `@uni-helper/axios-adapter/webpack` 即可

### 版本

自 1.4.0 开始，请始终保持主版本号和次版本号与 axios 一致。例如当你安装了 1.5.1 版本时，你可以安装 axios 的 1.5.x 版本。

这样做的目的是始终支持最新的 axios。
