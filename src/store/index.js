import { createStore } from 'vuex'
import diet from './modules/diet.js'
import dashResult from './modules/dashResult.js'

export default createStore({
  modules: {
    diet,
    dashResult,
  },
  state() {
    return {
      person: {
        age: '',
        gender: '',
        region: { id: null, name: '' },
        rost: '',
        ves: '',
        taliya: '',
        fizActive: '',
        yagody: '',
        arteriya: '',
        sahar: '',
        diabet: '',
        priem: '',
        diabetFamily: '',
      },
      musicFon: {
        path: '/music/1.wav',
        status: 'play',
        volume: 1,
        fadeRequest: 0, // 👈 счётчик триггеров
        fadeTarget: null, // 0..1
      },
    }
  },

  mutations: {
    updatePerson(state, payload) {
      // обновляем любые поля
      Object.assign(state.person, payload)
    },
    resetPerson(state) {
      console.log('reset')

      state.person = {
        age: '',
        gender: '',
        region: { id: null, name: '' },
        rost: '',
        ves: '',
        taliya: '',
        fizActive: '',
        yagody: '',
        arteriya: '',
        sahar: '',
        diabet: '',
        priem: '',
        diabetFamily: '',
      }
    },
    SET_STATUS(state, status) {
      state.musicFon.status = status
    },
    SET_VOLUME(state, volume) {
      state.musicFon.volume = volume
    },
    REQUEST_FADE(state, targetVolume) {
      state.musicFon.fadeRequest++
      state.musicFon.fadeTarget = targetVolume
    },
  },
  actions: {
    play({ commit }) {
      commit('SET_STATUS', 'play')
    },
    pause({ commit }) {
      commit('SET_STATUS', 'pause')
    },
    fadeOut({ commit }) {
      commit('REQUEST_FADE', 0)
    },
    fadeIn({ commit }) {
      commit('REQUEST_FADE', 1)
    },
  },
})
