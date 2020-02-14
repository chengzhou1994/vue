import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";
// 导入全局样式
import "./assets/css/global.css";
// 导入字体图标
import "./assets/fonts/iconfont.css";

import axios from "axios";

// 设置axios请求的根路径

axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";

// http request 拦截器

// axios请求拦截添加token保证拥有获取数据的权限，config是请求对象
// 保证有权限的api可以调用
axios.interceptors.request.use(config => {
  // Do something before request is sent
  // config 是请求对象 添加TOKEN验证的Authorization 字段
  // 令牌保存在token字段中
  config.headers.Authorization = window.sessionStorage.getItem("token"); // 将token设置成请求头
  return config;
});

// axios挂载到vue的原型上的属性起个名字http，每个组件可以用this调用$http,即this.$http
Vue.prototype.$http = axios;
Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");

