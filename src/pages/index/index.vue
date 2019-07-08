<template>
  <div>
    <button @tap="addDevice">添加设备</button>
    <button @tap="onRecognize">智能识别</button>
  </div>
</template>

<script>
// import request from "@/utils/request";

export default {
  data () {
    return {
    }
  },
  onLoad() {
    wx.setNavigationBarTitle({
      title: '首页',
    })
  },
  methods: {
    addDevice() {
      wx.navigateTo({ 
        url: '/pages/addDevice/main' 
      });
    },
    onRecognize() {
      wx.navigateTo({ 
        url: '/pages/recognize/main' 
      });
    },
  },
  created () {
    // let app = getApp()
  }
}
</script>

<style scoped>
</style>
