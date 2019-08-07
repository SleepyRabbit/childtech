<template>
  <div>
    <label>当前温度:  {{value}}</label>
  </div>
</template>

<script>

export default {
  data () {
    return {
      deviceId: "",
      value: 0,
    }
  },
  onLoad(data) {
    if(data.deviceId) {
      this.deviceId = data.deviceId;
      console.log("deviceId: ", this.deviceId);
    }
  },
  onShow() {
    this.init();
  },
  methods: {
    init: function() {
      this.getBLEDeviceCharacteristics(this.deviceId, "0000FFF0-0000-1000-8000-00805F9B34FB");
      // this.getBLEDeviceCharacteristics(this.deviceId, "0000180D-0000-1000-8000-00805F9B34FB");
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
            const item = res.characteristics[i];
            // if (item.properties.write) {
            //   this.canWrite = true;
            //   this._deviceId = deviceId
            //   this._serviceId = serviceId
            //   this._characteristicId = item.uuid
            //   break;
            // }
            if(item.properties.notify) {
              console.log("notify item:", item);
              wx.notifyBLECharacteristicValueChange({
                state: true,
                deviceId: deviceId,
                serviceId: serviceId,
                characteristicId: item.uuid,
                success: (res) => {
                  console.log('notifyBLECharacteristicValueChange success', res.errMsg);
                  wx.onBLECharacteristicValueChange(res => {
                    console.log('characteristic value comed:', this.ab2hex(res.value));
                    let num = this.ab2hex(res.value) * 1.6;
                    this.value = num.toFixed(1);
                  })
                }
              })
            }
          }
        },
        fail(res) {
          console.error('getBLEDeviceCharacteristics', res)
        }
      })
    },
    // 微信官方给的ArrayBuffer转16进度字符串示例
    ab2hex: function(buffer) {
      var hexArr = Array.prototype.map.call(
        new Uint8Array(buffer),
        function (bit) {
          return ('00' + bit.toString(16)).slice(-2)
        }
      )
      return hexArr.join(',');
    },
  }
}
</script>

<style>
</style>
