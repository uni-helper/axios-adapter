# @uni-helper/axios-adapter

this is an Axios adapter for uni-app

English | [简体中文](./README.zh-CN.md)

## Installation

```
pnpm i @uni-helper/axios-adapter axios
```

## Usage

```ts
import axios from "axios";
import { createUniAppAxiosAdapter } from "@uni-helper/axios-adapter";

const $axios = axios.create({
  adapter: createUniAppAxiosAdapter(),
});
```

## Client Types

```ts
/// <reference types="@uni-helper/axios-adapter/client" />
```

## Configuration

see [types.ts](./src/types.ts)


## Notes

Axios-adapter uses the built-in utility functions of Axios, but Axios does not export `"./lib/*": "./lib/*"`, so you need to use a tool like `pnpm patch` to export it.

Here's an example: [axios@1.2.1.patch](./patches/axios%401.2.1.patch)
