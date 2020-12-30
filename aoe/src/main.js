import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueBus from 'vue-bus';

Vue.config.productionTip = false
Vue.use(VueBus);
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
