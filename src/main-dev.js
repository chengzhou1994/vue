import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";
// 导入全局样式
import "./assets/css/global.css";
// 导入字体图标
import "./assets/fonts/iconfont.css";

import TreeTable from "vue-table-with-tree-grid";
// 导入富文本编辑器

import VueQuillEditor from "vue-quill-editor";
// require styles 导入富文本编辑器对应样式的样式
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
// 导入 NProgress 包对应的JS和CSS
import NProgress from "nprogress";
import "nprogress/nprogress.css";

import axios from "axios";
// 设置axios请求的根路径
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";

// http request 拦截器
// axios请求拦截添加token保证拥有获取数据的权限，config是请求对象
// 保证有权限的api可以调用
// 在request拦截器中,展示进度条 NProgress.start();
axios.interceptors.request.use(config => {
  // config 是请求对象 添加TOKEN验证的Authorization 字段
  // 令牌保存在token字段中
  NProgress.start();
  config.headers.Authorization = window.sessionStorage.getItem("token"); // 将token设置成请求头
  return config;
});

// 在response拦截器中隐藏进度条 NProgress.done();
axios.interceptors.response.use(config => {
  NProgress.done();
  return config;
});

// axios挂载到vue的原型上的属性起个名字http，每个组件可以用this调用$http,即this.$http
Vue.prototype.$http = axios;

Vue.config.productionTip = false;

// 全局注册这个插件vue-table-with-tree-grid
Vue.component("tree-table", TreeTable);

/* { default global options } */
// 这是将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor);

// 定义全局时间格式化过滤器
Vue.filter("dataFormat", function(originVal) {
  const dt = new Date(originVal);

  const y = dt.getFullYear();

  const m = (dt.getMonth() + 1 + "").padStart(2, "0");

  const d = (dt.getDate() + "").padStart(2, "0");

  const hh = (dt.getHours() + "").padStart(2, "0");

  const mm = (dt.getMinutes() + "").padStart(2, "0");

  const ss = (dt.getSeconds() + "").padStart(2, "0");

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
});

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
