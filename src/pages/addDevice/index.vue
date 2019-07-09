<template>
  <div class="page-root">
    <loading v-if="isScaning">正在扫描蓝牙设备...</loading>
    <loading v-if="isConnecting">正在连接...</loading>
    <scroll-view class="device-container" scroll-y="true" scroll-with-animation="true" :style="{height: svHeight + 'px'}">
      <div v-for="(device,index) in devices" :key="index" class="device_card" :style="{ backgroundColor: index === sel_index ? '#ccc' : 'white' }" @tap="onSelect(index)">
        <div>{{device.name}}</div>
        <div>{{device.deviceId}}</div>
        <div>{{device.RSSI}}</div>
      </div>
    </scroll-view>
    <button :disabled="sel_index < 0" class="connect" @tap="onConnect">连接</button>
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
          RSSI: "-32",
        },
      ],
      sel_index: -1,
      isScaning: true,
      isConnecting: false,
      svHeight:0,
    }
  },
  onLoad() {
    wx.setNavigationBarTitle({
      // title: '添加设备',
      title: '添加',
    })
    this.openBluetoothAdapter();
  },
  mounted(){
    let screenHeight = wx.getSystemInfoSync().windowHeight;
    this.svHeight = screenHeight - 49;
  },
  methods: {
    onSelect(index) {
      console.log("onSelect: ", index);
      this.sel_index = index;
    },
    onConnect() {
      let device = this.devices[this.sel_index];
      console.log("onConnect: ", device);
      this.connectDevice(device.deviceId)
    },
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
              // if (JSON.stringify(res.devices).indexOf(this.deviceName) !== -1) {
              //   for (let i = 0; i < res.devices.length; i++) {
              //     if (this.deviceName === res.devices[i].name) {
              //       /* 根据指定的蓝牙设备名称匹配到deviceId */
              //       this.deviceId = this.devices[i].deviceId;
              //       setTimeout(() => {
              //         // this.connectTO();
              //       }, 2000);
              //     };
              //   };
              // } else {
              // }
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
    connectDevice(deviceId) {
      console.log("connecting: ", deviceId);
      this.isConnecting = true;
      wx.createBLEConnection({
        deviceId: deviceId,
        success: res => {
          this.isConnecting = false;
          console.log("Connect device successful!")
          // this.connectedDeviceId = deviceId;
          /* 4.获取连接设备的service服务 */
          // that.getBLEDeviceServices();
          // wx.stopBluetoothDevicesDiscovery({
          //   success: res => {
          //     console.log(res, '停止搜索')
          //   },
          //   fail: res => {
          //   }
          // })
        },
        fail: res => {
          this.isConnecting = false;
          console.log("Connect device failed!")
        }
      })
    }
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
  height: 110px;
  /* margin-top: 10px; */
  margin-bottom: 10px;
  background-color: #FFFFFF;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.08);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-Content: space-around;
}
.connect {
  position:fixed;
  bottom:0;
  background: #FFFFFF;
  height:49px;
  width:100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
