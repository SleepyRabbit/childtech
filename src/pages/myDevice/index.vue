<template>
  <div class="page-root">
    <scroll-view class="device-container" scroll-y="true" scroll-with-animation="true" :style="{height: svHeight + 'px'}">
      <div v-for="(device,index) in getMyDevices" :key="index" class="device_card" :style="{ backgroundColor: index === sel_index ? '#ccc' : 'white' }" @tap="onSelect(index)">
        <div>{{device.name}}</div>
        <!-- <div>{{device.deviceId}}</div> -->
        <div>{{device.RSSI}}</div>
        <!-- <div v-if="connectedDevice.deviceId === device.deviceId">已连接</div> -->
      </div>
    </scroll-view>
    <button :disabled="sel_index < 0" class="connect" @tap="onDisconnect">断开连接</button>
  </div>
</template>

<script>
import widget from '@/utils/widget'
import { mapActions, mapGetters } from 'vuex'

const LAST_CONNECTED_DEVICE = 'last_connected_device'

export default {
  data () {
    return {
      devices: [],
      connectedDevice: null,
      sel_index: -1,
    }
  },
  onLoad() {
    wx.setNavigationBarTitle({
      // title: '添加设备',
      title: '我的设备',
    })
  },
  onUnload() {
    console.log("onUnload!");
  },
  onShow() {
    this.init();
    console.log("getMyDevices: ", this.getMyDevices);
    this.getConnectedBluetoothDevices();
  },
  mounted(){
    let screenHeight = wx.getSystemInfoSync().windowHeight;
    this.svHeight = screenHeight - 49;
  },
  computed: {
    ...mapGetters([
      'getMyDevices',
    ]),
  },
  methods: {
    ...mapActions([
      'delMyDevice',
    ]),
    init() {
      this.sel_index = -1;
    },
    onSelect(index) {
      console.log("onSelect: ", index);
      this.sel_index = index;
    },
    onDisconnect() {
      let device = this.getMyDevices[this.sel_index];
      console.log("onConnect: ", device);
      this.closeBLEConnection(device);
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
    closeBLEConnection(device) {
      wx.closeBLEConnection({
        deviceId: device.deviceId,
        success: res => {
          console.log("closeBLEConnection successful!");
          this.delMyDevice(device);
        },
        fail: res => {
          console.log("closeBLEConnection failed!");
        }
      })
      this.connected = false;
    },
  },
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
