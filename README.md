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
