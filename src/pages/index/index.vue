<template>
  <div>
    <!-- <button @click="onSelect">选择图片</button> -->
    <button @tap="onSelect">选择图片</button>
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
      imgFilePaths: []
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
        this.token = res.access_token;
        // console.log("has token: ", this.token)
        console.log("get access_token successful!");
      } else {
        console.log("has no access_token!");
      }
    },
    onSelect() {
      wx.chooseImage({
        count: '9', //最多可以选择的图片张数,
        success: res => {
          this.imgFilePaths = res.tempFilePaths;
          console.log("this.imgFilePaths: ", this.imgFilePaths);
        }, //返回图片的本地文件路径列表 tempFilePaths,
        fail: () => {
          console.log("failed");
        },
        complete: () => {
          console.log('commplete');
        }
      });
    }
  },

  created () {
    // let app = getApp()
  }
}
</script>

<style scoped>
.userinfo {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.userinfo-avatar {
  width: 128rpx;
  height: 128rpx;
  margin: 20rpx;
  border-radius: 50%;
}

.userinfo-nickname {
  color: #aaa;
}

.usermotto {
  margin-top: 150px;
}

.form-control {
  display: block;
  padding: 0 12px;
  margin-bottom: 5px;
  border: 1px solid #ccc;
}
.all{
  width:7.5rem;
  height:1rem;
  background-color:blue;
}
.all:after{
  display:block;
  content:'';
  clear:both;
}
.left{
  float:left;
  width:3rem;
  height:1rem;
  background-color:red;
}

.right{
  float:left;
  width:4.5rem;
  height:1rem;
  background-color:green;
}
</style>
