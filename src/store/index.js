import { createStore } from 'vuex';
import diet from './modules/diet.js';

export default createStore({
  modules: {
    diet
  },
  state() {
    return {
      person: {
        age: "",
        gender: "",
        region: { id: null, name: "" },
        rost: "",
        ves: "",
        taliya: "",
        fizActive: "",
        yagody: "",
        arteriya: "",
        sahar: "",
        diabet: "",
        priem: "",
        diabetFamily: "",
      }
    };
  },

  mutations: {
    updatePerson(state, payload) {
      // обновляем любые поля
      Object.assign(state.person, payload);
    }
  }
});