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

const LAST_CONNECTED_DEVICE = 'last_connected_device'

export default {
  data () {
    return {
      devices: [],
      deviceId: "",
      sel_index: -1,
      isScaning: true,
      isConnecting: false,
      svHeight: 0,
      connected: false,
    }
  },
  onLoad() {
    wx.setNavigationBarTitle({
      // title: '添加设备',
      title: '添加',
    })
  },
  onUnload() {
    console.log("onUnload!")
    this.closeBluetoothAdapter();
  },
  onShow() {
    console.log("onshow devices: ", this.devices);
    this.devices = [];
    this.sel_index = -1;
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
      this.createBLEConnection(device.deviceId, device.name);
    },
    openBluetoothAdapter() {
      if (!wx.openBluetoothAdapter) {
        this.isScaning = false;
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })
        return
      }
      wx.openBluetoothAdapter({
        success: (res) => {
          console.log('openBluetoothAdapter success', res)
          this.startBluetoothDevicesDiscovery()
        },
        fail: (res) => {
          this.isScaning = false;
          console.log('openBluetoothAdapter fail', res)
          if (res.errCode === 10001) {
            wx.showModal({
              title: '错误',
              content: '未找到蓝牙设备, 请打开蓝牙后重试。',
              showCancel: false
            })
            wx.onBluetoothAdapterStateChange((res) => {
              console.log('onBluetoothAdapterStateChange', res)
              if (res.available) {
                // 取消监听，否则stopBluetoothDevicesDiscovery后仍会继续触发onBluetoothAdapterStateChange，
                // 导致再次调用startBluetoothDevicesDiscovery
                wx.onBluetoothAdapterStateChange(() => {
                });
                this.startBluetoothDevicesDiscovery()
              }
            })
          }
        }
      })
      wx.onBLEConnectionStateChange((res) => {
        // 该方法回调中可以用于处理连接意外断开等异常情况
        console.log('onBLEConnectionStateChange', `device ${res.deviceId} state has changed, connected: ${res.connected}`)
        this.connected = res.connected;
        if (!res.connected) {
          wx.showModal({
            title: '错误',
            content: '蓝牙连接已断开',
            showCancel: false
          })
        }
      });
    },
    getBluetoothAdapterState() {
      wx.getBluetoothAdapterState({
        success: (res) => {
          console.log('getBluetoothAdapterState', res)
          if (res.discovering) {
            this.onBluetoothDeviceFound()
          } else if (res.available) {
            this.startBluetoothDevicesDiscovery()
          }
        }
      })
    },
    startBluetoothDevicesDiscovery() {
      wx.startBluetoothDevicesDiscovery({
        success: (res) => {
          console.log('startBluetoothDevicesDiscovery success', res)
          this.onBluetoothDeviceFound()
        },
        fail: (res) => {
          this.isScaning = false;
          console.log('startBluetoothDevicesDiscovery fail', res)
        }
      })
    },
    stopBluetoothDevicesDiscovery() {
      wx.stopBluetoothDevicesDiscovery({
        complete: () => {
          console.log('stopBluetoothDevicesDiscovery')
          this._discoveryStarted = false
        }
      })
    },
    onBluetoothDeviceFound() {
      this.isScaning = false;
      wx.onBluetoothDeviceFound((res) => {
        // console.log("onBluetoothDeviceFound: ", res);
        res.devices.forEach(device => {
          if (!device.name && !device.localName) {
            return
          }
          console.log("onBluetoothDeviceFound: ", res.devices);
          let index = this.devices.indexOf(device);
          console.log("index: ", index);
          if(index > -1) {
            console.log("index > -1: ", this.devices[index]);
            console.log("index > -1: ", device);
            this.devices[index] = device;
          } else {
            this.devices.push(device);
          }
        })
      })
    },
    createBLEConnection(deviceId, name) {
      this.isConnecting = true;
      wx.createBLEConnection({
        deviceId,
        success: () => {
          this.isConnecting = false;
          console.log('createBLEConnection success');
          widget.showToast("蓝牙连接成功!");
          this.connected = true;
          this.deviceId = deviceId;
          this.getBLEDeviceServices(deviceId)
          wx.setStorage({
            key: LAST_CONNECTED_DEVICE,
            data: name + ':' + deviceId
          })
        },
        complete() {
          this.isConnecting = false;
        },
        fail: (res) => {
          this.isConnecting = false;
          console.log('createBLEConnection fail', res);
          widget.showToast("蓝牙连接失败!");
        }
      })
      this.stopBluetoothDevicesDiscovery()
    },
    getBLEDeviceServices(deviceId) {
      wx.getBLEDeviceServices({
        deviceId,
        success: (res) => {
          console.log('getBLEDeviceServices', res)
          for (let i = 0; i < res.services.length; i++) {
            if (res.services[i].isPrimary) {
              this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
              return
            }
          }
        }
      })
    },
    getBLEDeviceCharacteristics(deviceId, serviceId) {
      wx.getBLEDeviceCharacteristics({
        deviceId,
        serviceId,
        success: (res) => {
          console.log('getBLEDeviceCharacteristics success', res.characteristics)
          // 这里会存在特征值是支持write，写入成功但是没有任何反应的情况
          // 只能一个个去试
          for (let i = 0; i < res.characteristics.length; i++) {
            const item = res.characteristics[i]
            if (item.properties.write) {
              this.setData({
                canWrite: true
              })
              this._deviceId = deviceId
              this._serviceId = serviceId
              this._characteristicId = item.uuid
              break;
            }
          }
        },
        fail(res) {
          console.error('getBLEDeviceCharacteristics', res)
        }
      })
    },
    closeBLEConnection() {
      wx.closeBLEConnection({
        deviceId: this.deviceId
      })
      this.connected = false;
    },
    closeBluetoothAdapter() {
      wx.closeBluetoothAdapter()
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
  height: 50px;
  /* height: 110px; */
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
