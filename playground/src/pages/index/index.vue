<script setup lang="ts">
import { useAxios } from "@vueuse/integrations/useAxios";
import { createUniAppAxiosAdapter } from "@uni-helper/axios-adapter";
import axios from "axios";
axios.defaults.adapter = createUniAppAxiosAdapter();
const instance = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com/",
  enableCache: true,
  enableQuic: true,
  enableHttp2: true
});

const {
  data,
  error,
  response,
  isFinished,
  isAborted,
  isCanceled,
  isLoading,
  execute,
  abort,
} = useAxios("/posts/1", instance, {
  immediate: false,
});

execute({
  params: {
    pid: "233",
  },
});
</script>

<template>
  <view class="content">
    <view class="action">
      <button @click="() => execute()">execute</button>
      <button @click="() => abort()">abort</button>
    </view>
    <view class="cell">
      <view class="cell__title">status:</view>
      <view class="cell__value">isFinished: {{ isFinished }} <br />isAborted:{{ isAborted }}
        <br />isCanceled:{{ isCanceled }} <br />isLoading:{{ isLoading }}
      </view>
    </view>
    <view class="cell">
      <view class="cell__title">data:</view>
      <view class="cell__value">{{ JSON.stringify(data, null, 4) }}</view>
    </view>
    <view class="cell">
      <view class="cell__title">error:</view>
      <view class="cell__value">{{ JSON.stringify(error, null, 4) }}</view>
    </view>
    <view class="cell">
      <view class="cell__title">response:</view>
      <view class="cell__value">{{ JSON.stringify(response, null, 4) }}</view>
    </view>
  </view>
</template>

<style>
.action {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.cell__title {
  font-weight: bold;
  font-size: 1.2em;
  margin: 20px 0;
}

.cell__value {
  white-space: pre;
  overflow: auto;
  padding: 20px 10px;
  background-color: #333;
  margin: 10px;
  border-radius: 10px;
  color: #eee;
}

.content {
  display: flex;
  flex-direction: column;
}
</style>
