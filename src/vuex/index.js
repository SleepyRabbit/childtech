import Vue from "vue";
import Vuex from "vuex";
import ble from "./config/ble";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    ble,
  }
});