<template>
  <div>
    <div class="photo_container" v-if="imgFilePaths">
      <image class="hasphoto" :src="imgFilePaths" @tap="onSelect"></image>
    </div>
    <div class="photo_container" v-else>
      <image class="nophoto" src="/static/images/photo.png" @tap="onSelect"></image>
    </div>
    <button :disabled="disabled" @tap="onIdentification">开始识别</button>
    <loading v-if="isDetecting">正在识别...</loading>
    <div v-for="(item, index) in recognition_result" :key="index">
      <label for="">{{item.name}}</label>
    </div>
  </div>
</template>

<script>
import request from "@/utils/request";

let option = {
  client_id: "9yo34fa44h5pXhhsfbuzllBe",
  client_secret: "tZTEmxMTbBHZkyHKNBGERIoBfw9V20Ig",
}

export default {
  data () {
    return {
      access_token: "",
      imgFilePaths: "",
      imgBase64: "",
      isDetecting: false,
      disabled: true,
      recognition_result: []
    }
  },
  onLoad() {
    this.getToken();
  },
  methods: {
    async getToken() {
      let url_param = `?grant_type=client_credentials&client_id=${option.client_id}&client_secret=${option.client_secret}`
      let url = "https://aip.baidubce.com/oauth/2.0/token" + url_param;
      let opt = {
        contentType: "application/json"
      }
      let res = await request.fetchData(url, null, opt);
      // console.log("Res ", res);
      if(res && res.access_token) {
        this.access_token = res.access_token;
        // console.log("has token: ", this.token)
        console.log("get access_token successful!");
      } else {
        console.log("has no access_token!");
      }
    },
    onSelect() {
      wx.chooseImage({
        count: '1', //最多可以选择的图片张数,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: res => {
          this.disabled = true;
          this.imgFilePaths = res.tempFilePaths;
          // console.log("this.imgFilePaths: ", this.imgFilePaths);
          // 将用户选择的图片转成base64
          wx.request({
            url: this.imgFilePaths[0],
            method: 'GET',
            responseType: 'arraybuffer', 
            success: res => {
              this.imgBase64 = wx.arrayBufferToBase64(res.data);
              // console.log("this.imgBase64 : ", this.imgBase64 );
              this.disabled = false;
            },
            fail: () => {
              console.log("failed");
            }
          })
        }, //返回图片的本地文件路径列表 tempFilePaths,
        fail: () => {
          console.log("failed");
        },
        complete: () => {
          console.log('commplete');
        }
      });
    },
    async uploadFile() {
      let url_param = `/plant?access_token=${this.access_token}`;
      let url = "https://aip.baidubce.com/rest/2.0/image-classify/v1" + url_param;
      let opt = {
        // contentType: "application/json;charset=UTF-8"
      }
      let data = {
        image_type: 'BASE64',
        image: this.imgBase64,
        group_id_list : "gropu001",
        user_id: "001",
      }
      let res = await request.fetchData(url, data, opt);
      this.isDetecting = false;
      if(res && res.error_code) {
        console.log("err code:", res.error_code, "\nerr msg:", res.error_msg)
      }
      else {
        // console.log("ai response data: ", res);
        this.recognition_result = res.result;
      }
    },
    async onIdentification() {
      this.isDetecting = true;
      await this.uploadFile();
    }
  },

  created () {
    // let app = getApp()
  }
}
</script>

<style scoped>
.photo_container {
  width: 100%;
  height: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
}
.hasphoto {
  width: 100%;
  height: 100vw;
}
.nophoto {
  width: 40%;
  height: 40vw;
}
</style>
