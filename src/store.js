import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    debug: true,
    internalCache: null
  },
  getters: {
    internalCache(state) {
      return state.internalCache
    },
  },
  mutations: {
    updateInternalCache (state, newCache) {
      if (state.debug) {
        console.log('setInternalCache triggered --', newCache)
      }
      state.internalCache = newCache
    }
  },
  actions: {
   
  }
})
