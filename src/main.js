import Vue from 'vue'
import VueResource from 'vue-resource'
import VueI18n from 'vue-i18n'
import VueIntro from 'vue-introjs'
import VueCodemirror from 'vue-codemirror'

import IView from 'iview'

import 'iview/dist/styles/iview.css'
import 'font-awesome/css/font-awesome.min.css'
import 'intro.js/introjs.css'
import 'codemirror/lib/codemirror.css'

import App from './App.vue'
import router from './router'
import store from './store'
import messages from './messages'

Vue.config.productionTip = false
Vue.use(VueI18n)
Vue.use(IView)
Vue.use(VueResource)
Vue.use(VueIntro)
Vue.use(VueCodemirror)

const i18n = new VueI18n({
  locale: 'zh', // 语言标识
  messages
})

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
