"use strict";

const state = {
  adapterOpened: false,
  connectedDevice: "",
};

const mutations = {
  setAdapterState(state, data) {
    state.adapterOpened = data;
  },
  setConnectedDevice(state, data) {
    state.connectedDevice = data;
  },
};

const actions = {
  setAdapterState: ({commit}, data) => {
    commit('setAdapterState', data);
  },
  setConnectedDevice: ({commit}, data) => {
    commit('setConnectedDevice', data);
  },
};

const getters = {
  getAdapterState: (state) => state.adapterOpened,
  getConnectedDevice: (state) => state.connectedDevice,
};

export default {
  state,
  mutations,
  actions,
  getters,
}