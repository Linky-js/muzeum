import { createStore } from 'vuex';
import diet from './modules/diet.js';

export default createStore({
  modules: {
    diet
  }
});