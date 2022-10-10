# axios-plugin-uniapp

this plugin is Axios adapter for uniapp

English | [简体中文](./README.zh-CN.md)

## Installation

```
pnpm i axios-plugin-uniapp
```

## Usage

```ts
import axios from "axios";
import { uniappAdapter } from "axios-plugin-uniapp";

const $axios = axios.create({
  adapter: uniappAdapter,
});
```
