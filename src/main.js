// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import store  from './store'
Vue.config.productionTip = false


// 消除 click 移动浏览器300ms延迟，这样就可以用click 替代 touch 事件了 
import attachFastClick from 'fastclick'
attachFastClick.attach(document.body)

// 图片懒加载插件 
import VueLazyload from 'vue-lazyload'
Vue.use(VueLazyload, {
  loading: require('@/common/image/default.png')
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store ,
  components: { App },
  template: '<App/>'
})
