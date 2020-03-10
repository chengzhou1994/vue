import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../components/Login.vue";
import Home from "../components/Home.vue";
import Welcome from "../components/Welcome.vue";
import Users from "../components/user/Users.vue";
import Rights from "../components/power/Rights.vue";
import Roles from "../components/power/Roles.vue";
import Cate from "../components/goods/Cate.vue";
import Params from "../components/goods/Params.vue";
import GoodList from "../components/goods/List.vue";
import Add from "../components/goods/Add.vue";

Vue.use(VueRouter);

const routes = [
  {
    // 路由重定向
    path: "/",
    redirect: "/login"
  },
  {
    path: "/login",
    component: Login
  },
  {
    path: "/home",
    component: Home,
    // 只要访问/home，重定向到/welcome
    redirect: "/welcome",
    children: [
      {
        // 以“/”开头的嵌套路径会被当作根路径，所以子路由上不用加“/”;
        // 在生成路由时，主路由上的path会被自动添加到子路由之前，所以子路由上的path不用在重新声明主路由上的path了。
        // 在home页面嵌套welecome
        path: "/welcome",
        component: Welcome
      },
      {
        path: "/users",
        component: Users
      },
      {
        path: "/rights",
        component: Rights
      },
      {
        path: "/roles",
        component: Roles
      },
      {
        path: "/categories",
        component: Cate
      },
      {
        path: "/params",
        component: Params
      },
      {
        path: "/goods",
        component: GoodList
      },
      {
        path: "/goods/add",
        component: Add
      }
    ]
  }
];

const router = new VueRouter({
  routes
});

// 如果用户没有登陆，但是可以直接可以通过url访问特定页面，需要重新导航到登陆页面
// 挂载路由导航守卫控制访问权限
router.beforeEach((to, from, next) => {
  // to and from are both route objects. must call `next`.
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next()代表直接放行 next('/login')强制放行到哪个路径
  // 如果用户访问的是登陆页，直接放行
  if (to.path === "/login") return next();
  // 从sessionStorage获取保存token值
  const tokenStr = window.sessionStorage.getItem("token");
  // 判断tokenStr是否有值
  if (!tokenStr) return next("/login");
  next();
});
export default router;
