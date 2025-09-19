import { createStore } from 'vuex';
const CART_SEMPLE_KEY = 'cartSempl';
const CART_KOVRY_KEY = 'cartKovry';
export default createStore({
  state: {
    user: {
      user_id: false,
      username: 'guest', //--не залогинен
      auth_key: 'B89M5gVTJbiMZW-0gHsblJ-6-4yt7aw7',
      email: '',
      role: {
        item_name: 'guest',
      },
      name: '',
      profile: {},
      cart_id: null,

      isLogged: false,
    },
    products: [],
    sempls: [],
    favorites: [],
    cartCount: 0,
    isMobile: false,
    apiUrl: 'https://apilum.webtm.ru/web/index.php?r=',
    apiDomain: 'https://apilum.webtm.ru',
    flash_messsage: {
      title: '',
      massage: '',
      type: '',
    },
    cartSemple: JSON.parse(localStorage.getItem(CART_SEMPLE_KEY)) || [],
    cartKovry: JSON.parse(localStorage.getItem(CART_KOVRY_KEY)) || [],
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setUserData(state, user) {
      if (user.id) {
        state.user.user_id = user.id;
      }
      if (user.username) {
        state.user.username = user.username;
      }
      if (user.auth_key) {
        state.user.auth_key = user.auth_key;
      }
      if (user.tg) {
        state.user.tg = user.tg;
      }
      if (user.email) {
        state.user.email = user.email;
      }
      if (user.role) {
        state.user.role = user.role;
      }
      if (user.profile) {
        state.user.profile = user.profile;
      }
    },
    setProducts(state, products) {
      state.products = products;
    },
    setSempls(state, sempls) {
      state.sempls = sempls;
    },
    setFavorites(state, favorites) {
      state.favorites = favorites;
    },
    setCount(state, cartCount) {
      state.cartCount = cartCount;
    },
    setLogged(state, logged) {
      state.user.isLogged = logged;
    },
    setIsMobile(state, isMobile) {
      state.isMobile = isMobile;
    },
    setFlashMessage(state, flashMessage) {
      state.flash_messsage = flashMessage;
    },
    addToCartSempl(state, product) {
      const exists = state.cartSemple.find(p => p.id === product.id);
      if (!exists) {
        state.cartSemple.push(product);
        localStorage.setItem(CART_SEMPLE_KEY, JSON.stringify(state.cartSemple));
      }
    },
    removeFromCartSempl(state, productId) {
      state.cartSemple = state.cartSemple.filter(p => p.id !== productId);
      localStorage.setItem(CART_SEMPLE_KEY, JSON.stringify(state.cartSemple));
    },
    clearCartSempl(state) {
      state.cartSemple = [];
      localStorage.removeItem(CART_SEMPLE_KEY);
    },
    setCartSempl(state, payload) {
      state.cartSemple = payload;
      localStorage.setItem(CART_SEMPLE_KEY, JSON.stringify(payload));
    },


    addToCartKovry(state, product) {
      const exists = state.cartKovry.find(p => p.id === product.id);
      if (!exists) {
        state.cartKovry.push(product);
        localStorage.setItem(CART_KOVRY_KEY, JSON.stringify(state.cartKovry));
      }
    },
    removeFromCartKovry(state, productId) {
      state.cartKovry = state.cartKovry.filter(p => p.id !== productId);
      localStorage.setItem(CART_KOVRY_KEY, JSON.stringify(state.cartKovry));
    },
    clearCartKovry(state) {
      state.cartKovry = [];
      localStorage.removeItem(CART_KOVRY_KEY);
    },
    setCartKovry(state, payload) {
      state.cartKovry = payload;
      localStorage.setItem(CART_KOVRY_KEY, JSON.stringify(payload));
    }
  },
  getters: {
    getUser: (state) => {
      return state.user;
    },
    getIsMobile: (state) => {
      return state.isMobile;
    },
    getApiUrl: (state) => {
      return state.apiUrl;
    },
    getApiDomain: (state) => {
      return state.apiDomain;
    },
    getFlashMessage: (state) => {
      return state.flash_messsage;
    },
    getProducts: (state) => {
      return state.products;
    },
    getCount: (state) => {
      return state.cartCount;
    },
    getSempls: (state) => {
      return state.sempls;
    },
    getFavorites: (state) => {
      return state.favorites;
    },
    getCartSempl: (state) => state.cartSemple,
    getCartKovry: (state) => state.cartKovry,
    cartCount: (state) => state.cartSemple.length,
  },
});
