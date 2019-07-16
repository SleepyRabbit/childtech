"use strict";

const state = {
  adapterOpened: false,
};

const mutations = {
  setAdapterState(state, data) {
    state.adapterOpened = data;
  },
};

const actions = {
  setAdapterState: ({commit}, data) => {
    commit('setAdapterState', data);
  },
};

const getters = {
  getAdapterState: (state) => state.adapterOpened,
};

export default {
  state,
  mutations,
  actions,
  getters,
}