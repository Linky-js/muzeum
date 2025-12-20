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
  },
})
