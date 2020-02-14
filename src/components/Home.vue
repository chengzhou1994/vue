<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <!-- 每一个element中的组件名，都是一个类名 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt srcset />
        <span>江苏省南京市财政局OA</span>
      </div>
      <el-button type="primary" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <!-- isCollapse 为true时 是被折叠起来了 isCollapse为false 展开来 动态设置侧边栏的宽度-->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!--  侧边栏菜单区域-->
        <!-- unique-opened是否只保持一个子菜单的展开 默认为false -->

        <!-- collapse-transition是否开启折叠动画 默认为true 不开启 -->

        <!--collapse是否水平折叠收起菜单（仅在 mode 为 vertical 时可用）默认为false 不开启-->

        <!-- 是否启用vue-router的模式，启用该模式会在激活导航时以index的值作为path进行路由跳转，默认为false不启用-->

        <!-- 当前激活菜单的index可以复制给default-active 可以让当前菜单高亮 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <!-- 数值与空的字符缀拼接，整体是一个字符串-->
          <!-- index是唯一标志，只接收string -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i v-bind:class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/'+subItem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体区域 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      // 字体对象
      // <i class="iconfont icon-xxx"></i>
      iconsObj: {
        // 指向一个类名
        125: "iconfont icon-user",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju",
        145: "iconfont icon-baobiao"
      },
      // 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: ""
    };
  },

  // 生命周期函数，当页面加载的时候,应该立即获取左侧菜单数据
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem("activePath");
  },
  methods: {
    // 退出功能
    logout() {
      window.sessionStorage.clear();
      // 2. 通过编程式导航跳转到登陆主页，路由地址是 /login
      this.$router.push("/login");
    },
    // 获取左侧菜单所有数据
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      // 如果状态码不是200 弹出错误信息
      // console.log(res);
      // if (res.meta.status !== 200) {
      //   return this.$message.error("获取左侧菜单数据失败!");
      // };
      // this.$message.success(res.meta.msg);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

      /** 获取到的data是个数组，立即赋值给data中的menulist */
      this.menulist = res.data;
      // 获取数据后立即挂载到页面上
    },
    // 点击按钮，切换菜单的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      this.activePath = activePath;
    }
  }
};
</script>

<style lang="less" scoped>
.home-container {
  // 整个页面撑满全屏
  height: 100%;
}
// header布局
.el-header {
  background-color: #373d41;
  display: flex;
  // 左右贴边布局
  justify-content: space-between;
  padding-left: 0;
  // 退出按钮居中
  align-items: center;
  color: #fff;
  font-size: 20px;
  div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    // 没有边框线
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  // 鼠标放上去变成一个小手
  cursor: pointer;
}
</style>
