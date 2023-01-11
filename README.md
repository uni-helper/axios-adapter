<p align="center">
  <img width="300" src="./assets/logo.svg" alt="logo of @uni-helper/axios-adapter repository">
</p>

<h2 align='center'>@uni-helper/axios-adapter</h2>

<p align="center">Uniapp Axios Adapter for Vue2 and Vue3
</p>

English | [简体中文](./README.zh-CN.md)

## Installation

```
pnpm i @uni-helper/axios-adapter axios
```

## Usage

### Basic Usage

```ts
import axios from "axios";
import { createUniAppAxiosAdapter } from "@uni-helper/axios-adapter";

const instance = axios.create({
  adapter: createUniAppAxiosAdapter(),
});
```

### with useAxios

```ts
import axios from "axios";
import { useAxios } from "@vueuse/integrations/useAxios";
import { createUniAppAxiosAdapter } from "@uni-helper/axios-adapter";

const instance = axios.create({
  adapter: createUniAppAxiosAdapter(),
});

const { data, isFinished } = useAxios("/posts", instance);
```

### Upload and Download

```ts
import axios from "axios";
import { createUniAppAxiosAdapter } from "@uni-helper/axios-adapter";

const instance = axios.create({
  adapter: createUniAppAxiosAdapter(),
});

// a fake file
const data = new File([new Blob()], "emptyFile");

// download
instance.download("/");
// or
instance.request({
  url: "/",
  method: "download",
});

// upload
instance.upload("/", data);
// or
instance.request({
  url: "/",
  method: "upload",
  data,
});
```

## Client Types

```ts
/// <reference types="@uni-helper/axios-adapter/client" />
```
