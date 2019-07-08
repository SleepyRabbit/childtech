<template>
  <div class="page-root">
    <loading v-if="isScaning">正在扫描蓝牙设备...</loading>
    <div class="device-container">
      <div v-for="(device,index) in devices" :key="index" class="device_card">
        <div>{{device.name}}</div>
        <div>{{device.deviceId}}</div>
        <div>{{device.RSSI}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import widget from '@/utils/widget'

export default {
  data () {
    return {
      devices: [
        {
          name: "sss",
          deviceId: "123",
          RSSI: "-33",
        },
        {
          name: "sss",
          deviceId: "123",
          RSSI: "-33",
        },
      ],
      isScaning: true,
    }
  },
  onLoad() {
    wx.setNavigationBarTitle({
      title: '添加设备',
    })
    this.openBluetoothAdapter();
  },
  methods: {
    openBluetoothAdapter() {
      if(wx.openBluetoothAdapter) {
        console.log("wx.openBluetoothAdapter true!");
        wx.openBluetoothAdapter({
          success: res => {
            console.log("wx.openBluetoothAdapter success!");
            /* 获取本机的蓝牙状态 */
            setTimeout(() => {
                this.getBluetoothAdapterState()
            }, 1000)
          },
          fail: res => {
            // 初始化失败
            this.isScaning = false;
            widget.showToast("初始化蓝牙失败!");
            console.log("wx.openBluetoothAdapter failed:", res);
          }
        })
      } else {
        this.isScaning = false;
        console.log("wx.openBluetoothAdapter false!");
      }
    },
    getBluetoothAdapterState() {
      this.toastTitle = '检查蓝牙状态'
      wx.getBluetoothAdapterState({
        success: res => {
          console.log("wx.getBluetoothAdapterState success!");
          this.startBluetoothDevicesDiscovery()
        },
        fail: res => {
          this.isScaning = false;
          widget.showToast("本机蓝牙不可用!");
          console.log("wx.getBluetoothAdapterState falied:", res);
        }
      })
    },
    startBluetoothDevicesDiscovery() {
      setTimeout(() => {
        wx.startBluetoothDevicesDiscovery({
          success: res => {
            /* 获取蓝牙设备列表 */
            console.log("wx.startBluetoothDevicesDiscovery success!");
            this.getBluetoothDevices()
          },
          fail: res => {
            this.isScaning = false;
            widget.showToast("搜索蓝牙设备失败!");
            console.log("wx.startBluetoothDevicesDiscovery falied:", res);
          }
        })
      }, 1000)
    },
    getBluetoothDevices() {
      setTimeout(() => {
        wx.getBluetoothDevices({
          services: [],
          allowDuplicatesKey: false,
          interval: 0,
          success: res => {
            this.isScaning = false;
            console.log("wx.getBluetoothDevices success!");
            if (res.devices.length > 0) {
              console.log("res.devices.length > 0:", res.devices);
              this.devices = res.devices;
              if (JSON.stringify(res.devices).indexOf(this.deviceName) !== -1) {
                for (let i = 0; i < res.devices.length; i++) {
                  if (this.deviceName === res.devices[i].name) {
                    /* 根据指定的蓝牙设备名称匹配到deviceId */
                    this.deviceId = this.devices[i].deviceId;
                    setTimeout(() => {
                      // this.connectTO();
                    }, 2000);
                  };
                };
              } else {
              }
            } else {
            }
          },
          fail(res) {
            this.isScaning = false;
            widget.showToast("获取蓝牙设备列表失败!");
            console.log(res, '获取蓝牙设备列表失败=====')
          }
        })
      }, 2000)
    },
  },
  created () {
  }
}
</script>

<style scoped>
.page-root {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background-color: #F8F8F8;
}
.device-container {
  width: 100%;
  padding-top: 10px;
}
.device_card {
  border-radius: 5px;
  width: 94%;
  margin-left: 3%;
  height: 140px;
  /* margin-top: 10px; */
  margin-bottom: 10px;
  background-color: #FFFFFF;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.08);
  overflow: hidden;
}
</style>
