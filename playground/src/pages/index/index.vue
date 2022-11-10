<script setup lang="ts">
import { useAxios } from "@vueuse/integrations/useAxios";
import { createUniAppAxiosAdapter } from "axios-plugin-uniapp";
import axios from "axios";
import {  ref, watch } from "vue";
const adapter = createUniAppAxiosAdapter();
const instance = axios.create({
  adapter,
  baseURL: "https://jsonplaceholder.typicode.com/",
});
const { data, isFinished, error,  } = useAxios(
  "/posts/1",
  {
    data: {},
  },
  instance
);

const title = ref("Hello");
</script>

<template>
  <view class="content">
    <image class="logo" src="/static/logo.png" />
    <view class="text-area">
      <text class="title">{{ title }}</text>
    </view>
    <view class="title">data: {{ data }}</view>
    <view class="title">error: {{ error }}</view>
  </view>
</template>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
