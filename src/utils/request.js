import Fly from 'flyio';

const fly = new Fly();
const TIMEOUT = 15000;
const request = {
  async fetchData(url, data, opt = {}) {
    opt = opt || {};
    let showLogin = opt.showLogin;
    if (data) { // post请求
      try {
        let response = await fly.request(url, data, {
          method: 'post',
          timeout: TIMEOUT, // 超时设置
          parseJson: true,
          headers:{
            'content-type': opt.contentType || 'application/x-www-form-urlencoded'
          }
        });
        let result = response.data || '';
        return result;
      }catch(e) {
        throw e
      }
    } else { // get请求
        try {
            let res = await this.fetchDataString(url);
            return res;
        }catch (e){
            throw e;
        }
    }
  },
  /**
   * get请求
   * @param url
   * @param deep
   * @returns {Promise.<*>}
   */
  async fetchDataString(url) {
    try {
          let response = await fly.request(url, null, {
              method: 'get',
              timeout: TIMEOUT, // 超时设置
              parseJson: true,
          });
          return response.data;
        } catch (e) {
          throw e
        }
    },  
};

export default request;
