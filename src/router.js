import Vue from 'vue'
import Router from 'vue-router'
import Editor from './views/Editor.vue'
import Debug from './views/Debug.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'editor',
      component: Editor
    },
    {
      path: '/debug',
      name: 'debug',
      component: Debug
    }
  ]
})
