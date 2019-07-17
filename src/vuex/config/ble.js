"use strict";

const state = {
  adapterOpened: false,
  myDevices: [],
};

const mutations = {
  setAdapterState(state, data) {
    state.adapterOpened = data;
  },
  addMyDevice(state, data) {
    state.myDevices.push(data);
  },
  delMyDevice(state, data) {
    state.myDevices.pop(data);
  },
};

const actions = {
  setAdapterState: ({commit}, data) => {
    commit('setAdapterState', data);
  },
  addMyDevice: ({commit}, data) => {
    commit('addMyDevice', data);
  },
  delMyDevice: ({commit}, data) => {
    commit('delMyDevice', data);
  },
};

const getters = {
  getAdapterState: (state) => state.adapterOpened,
  getMyDevices: (state) => state.myDevices,
};

export default {
  state,
  mutations,
  actions,
  getters,
}