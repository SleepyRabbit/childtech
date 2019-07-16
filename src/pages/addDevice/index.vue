<template>
  <div class="page-root">
    <loading v-if="isScaning">{{msg}}</loading>
    <!-- <loading v-if="isScaning">正在扫描蓝牙设备...</loading> -->
    <loading v-if="isConnecting">正在连接...</loading>
    <scroll-view class="device-container" scroll-y="true" scroll-with-animation="true" :style="{height: svHeight + 'px'}">
      <div v-for="(device,index) in devices" :key="index" class="device_card" :style="{ backgroundColor: index === sel_index ? '#ccc' : 'white' }" @tap="onSelect(index)">
        <div>{{device.name}}</div>
        <!-- <div>{{device.deviceId}}</div> -->
        <div>{{device.RSSI}}</div>
        <div v-if="connectedDevice === device.deviceId">已连接</div>
      </div>
    </scroll-view>
    <button :disabled="sel_index < 0" class="connect" @tap="onConnect">连接</button>
  </div>
</template>

<script>
import widget from '@/utils/widget'
import { mapActions, mapGetters } from 'vuex'

const LAST_CONNECTED_DEVICE = 'last_connected_device'

export default {
  data () {
    return {
      msg: "正在扫描蓝牙设备...",
      devices: [],
      connectedDevice: "",
      sel_index: -1,
      isScaning: true,
      isConnecting: false,
      svHeight: 0,
      connected: false,
      timer: null,
    }
  },
  onLoad() {
    wx.setNavigationBarTitle({
      // title: '添加设备',
      title: '添加',
    })
  },
  onUnload() {
    console.log("onUnload!");
    this.stopBluetoothDevicesDiscovery();
  },
  onShow() {
    console.log("onshow devices: ", this.devices);
    this.init();
    console.log("this.getAdapterState: ", this.getAdapterState);
    // this.openBluetoothAdapter();
    if(!this.getAdapterState) {
      this.openBluetoothAdapter();
    }
    else {
      /* 获取本机的蓝牙状态 */
      setTimeout(() => {
        this.getBluetoothAdapterState()
      }, 100)
    }
  },
  mounted(){
    let screenHeight = wx.getSystemInfoSync().windowHeight;
    this.svHeight = screenHeight - 49;
  },
  computed: {
    ...mapGetters([
      'getAdapterState',
    ]),
  },
  methods: {
    ...mapActions([
      'setAdapterState',
    ]),
    init() {
      this.devices = [];
      this.sel_index = -1;
      this.isScaning = true;
    },
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
      this.msg = "正在初始化蓝牙适配器...";
      wx.openBluetoothAdapter({
        success: (res) => {
          console.log('openBluetoothAdapter success', res);
          this.setAdapterState(true);
          /* 获取本机的蓝牙状态 */
          setTimeout(() => {
            this.getBluetoothAdapterState()
          }, 100)
        },
        fail: (res) => {
          this.isScaning = false;
          console.log('openBluetoothAdapter fail', res)
          if (res.errCode === 10001) {
            wx.showToast({
              title: '蓝牙初始化失败',
              icon: 'success',
              duration: 2000
            })
            wx.onBluetoothAdapterStateChange((res) => {
              console.log('onBluetoothAdapterStateChange', res)
              if (res.available) {
                // 取消监听，否则stopBluetoothDevicesDiscovery后仍会继续触发onBluetoothAdapterStateChange，
                // 导致再次调用startBluetoothDevicesDiscovery
                wx.onBluetoothAdapterStateChange(() => {
                });
                setTimeout(() => {
                  this.getBluetoothAdapterState()
                }, 100)
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
      this.msg = "正在检查蓝牙适配器状态...";
      wx.getBluetoothAdapterState({
        success: (res) => {
          console.log("res: ", res);
          let available = res.available;
          let discovering = res.discovering;
          if (!res.available) {
            widget.showToast("设备无法开启蓝牙连接!");
          }
          else {
            if (res.discovering) {
              this.scanDevices();
              // this.onBluetoothDeviceFound();
            } else {
              this.startBluetoothDevicesDiscovery();
              this.getConnectedBluetoothDevices();
            }
          }
        }
      })
    },
    getConnectedBluetoothDevices() {
      wx.getConnectedBluetoothDevices({
        services: [],
        success: function (res) {
          console.log("getConnectedBluetoothDevices success:", JSON.stringify(res.devices));
        },
        fail: function(res) {
          console.log("getConnectedBluetoothDevices fail!", res);
        },
        complete: function() {
          console.log("getConnectedBluetoothDevices complete!");
        }
      })
    },
    startBluetoothDevicesDiscovery() {
      this.msg = "启动搜索...";
      setTimeout(() => {
        wx.startBluetoothDevicesDiscovery({
          success: (res) => {
            console.log('startBluetoothDevicesDiscovery success', res);
            this.scanDevices();
            // this.onBluetoothDeviceFound();
          },
          fail: (res) => {
            this.isScaning = false;
            console.log('startBluetoothDevicesDiscovery fail', res)
          }
        })
      }, 100)
    },
    stopBluetoothDevicesDiscovery() {
      if(this.timer) {
        clearInterval(this.timer);
      }
      wx.stopBluetoothDevicesDiscovery({
        complete: () => {
          console.log('stopBluetoothDevicesDiscovery')
          this._discoveryStarted = false
        }
      })
    },
    scanDevices() {
      this.isScaning = false;
      this.getBluetoothDevices();
      if(this.timer) {
        clearInterval(this.timer);
      }
      this.timer = setInterval(this.getBluetoothDevices, 3000);
    },
    getBluetoothDevices() {
      wx.getBluetoothDevices({
        services: [],
        allowDuplicatesKey: false,
        interval: 0,
        success: (res) => {
          console.log("getBluetoothDevices successful!", res);
          res.devices.forEach((device, index) => {
            if (!device.name && !device.localName) {
              return;
            }
            if(device.name !== "Paperang" && device.localName !== "Paperang") {
              return;
            }
            console.log("getBluetoothDevices: ", device, index);
            if(device.RSSI === 0) {
              return;
            }
            let isExist = false;
            let cnt = -1;
            this.devices.forEach((item, index) => {
              if(item.deviceId === device.deviceId) {
                cnt = index;
                isExist = true;
              }
            })
            if(!isExist) {
              this.devices.push(device);
            } else {
              // 直接给this.devices[cnt]赋值不会触发v-for刷新
              this.devices.splice(cnt, 1, device)
            }
          })
        },
        fail: (res) => {
          this.isScaning = false;
          console.log(res, '获取蓝牙设备列表失败=====')
        }
      })
    },
    onBluetoothDeviceFound() {
      wx.onBluetoothDeviceFound((res) => {
        // console.log("onBluetoothDeviceFound: ", res);
        res.devices.forEach(device => {
          if (!device.name && !device.localName) {
            return;
          }
          if(device.name !== "Paperang" && device.localName !== "Paperang") {
            return;
          }
          console.log("onBluetoothDeviceFound: ", res.devices);
          if(device.RSSI == 0) {
            return;
          }
          let isExist = false;
          let cnt = -1;
          this.devices.forEach((item, index) => {
            if(item.deviceId === device.deviceId) {
              cnt = index;
              isExist = true;
            }
          })
          if(!isExist) {
            this.devices.push(device);
          } else {
            // 直接给this.devices[cnt]赋值不会触发v-for刷新
            this.devices.splice(cnt, 1, device)
          }
        })
      })
    },
    createBLEConnection(deviceId, name) {
      this.isConnecting = true;
      this.stopBluetoothDevicesDiscovery();
      wx.createBLEConnection({
        deviceId,
        success: (res) => {
          this.isConnecting = false;
          console.log('createBLEConnection success!', res);
          widget.showToast("蓝牙连接成功!");
          this.connected = true;
          this.connectedDevice = deviceId;
          setTimeout(() => {
            this.getConnectedBluetoothDevices();
            this.getBLEDeviceServices(deviceId);
          }, 100)
          wx.setStorage({
            key: LAST_CONNECTED_DEVICE,
            data: name + ':' + deviceId
          })
        },
        complete: () => {
          this.isConnecting = false;
        },
        fail: (res) => {
          this.isConnecting = false;
          console.log('createBLEConnection fail', res);
          widget.showToast("蓝牙连接失败!");
        }
      })
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
              this.canWrite = true;
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
