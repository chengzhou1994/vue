<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <!-- Row 组件 提供 gutter 属性来指定每一栏之间的间隔，默认间隔为 0。 -->
        <!--el-row代表每一行 el-col代表每一列 span代表占多宽 一行有24个格子 每一格占6个-->
        <!-- 使用clearable属性即可得到一个可清空的输入框 -->
        <!-- clear在点击由 clearable 属性生成的清空按钮时触发 -->
        <!-- 搜索添加区域 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <!--  :data="数据源"，prop对应当前列内容的字段名，也可以使用 property 属性，label="列名"-->
      <el-table :data="userlist" :border="true" :stripe="true">
        <!-- 索引列  -->
        <!-- 如果需要显示索引，可以增加一列el-table-column，设置type属性为index即可显示从1开始的索引号。 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <!-- 插槽拿到当前行内对象(scope)数据，即scope.row -->
          <template slot-scope="scope">
            <!-- 让开关的状态关联到数据中mg_state-->
            <!--这一行的数据 {{scope.row}} -->
            <!-- 作用域插槽来决定操作列的渲染 -->
            <!-- value / v-model 绑定值boolean / string / number -->
            <!-- 绑定v-model到一个Boolean类型的变量。
            // 可以使用active-color属性与inactive-color属性来设置开关的背景色。-->
            <!-- change,switch状态发生变化时的回调监听函数,新状态的值 -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- scope.row -->
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <!-- Tooltip文字提示:展示鼠标 hover 时的提示信息。enterable鼠标是否可进入到tooltip中,默认true 可以进入-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区 -->
      <!-- layout 显示分页区页面布局结构 不建议动 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的对话框！运用到dialog对话框 -->
    <!-- 设置visible属性，它接收Boolean 默认false -->
    <!-- close: Dialog 关闭的回调 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed()">
      <!-- dialog内容主体区 -->
      <!-- form -->
      <!-- :model="数据绑定对象" prop="验证规则字段" :rules="数据验证规则对象" ref="引用对象"-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="addUser">确定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <!-- 用户名不需要检验规则，故删除 prop=""-->
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>当前的用户:{{this.userInfo.username}}</p>
        <p>当前的角色:{{this.userInfo.role_name}}</p>
        <!-- 下拉菜单 -->
        <p>
          分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data: function() {
    // 自定义验证邮箱的规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
      // 验证邮箱的正则表达式

      if (regEmail.test(value)) {
        // 合法的邮箱
        return callback();
      }
      callback(new Error("请输入合法的邮箱"));
    };
    //  自定义验证手机号的规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^[1][3,4,5,7,8][0-9]{9}$/;
      if (regMobile.test(value)) {
        // 合法的手机号码
        return callback();
      }
      callback(new Error("请输入合法的手机号码"));
    };

    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: "",
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      userlist: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,

      // 添加用户的表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          {
            required: true,
            message: "请输入用户名",
            // 鼠标失去焦点触发校验
            trigger: "blur"
          },
          {
            min: 6,
            max: 10,
            message: "用户名的长度在6到15个字符之间",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: "请输入密码",
            // 鼠标失去焦点触发校验
            trigger: "blur"
          },
          {
            min: 3,
            max: 10,
            message: "密码的长度在3到10个字符之间",
            trigger: "blur"
          }
        ],
        email: [
          {
            required: true,
            message: "请输入邮箱",
            // 鼠标失去焦点触发校验
            trigger: "blur"
          },
          // 邮箱是否合法
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          {
            required: true,
            message: "请输入手机号码",
            // 鼠标失去焦点触发校验
            trigger: "blur"
          },
          // 手机号码是否合法
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,

      // 这是查询到的用户信息对象
      editForm: {},

      // 修改表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: "请输入用户邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入用户手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      // 控制分配角色对话框的显隐
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表,把这个数据渲染到页面上
      rolesList: [],
      // 已选中的角色的id值,最新值
      selectedRoleId: ""
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    // get请求回返回一个promise对象，可以使用async await优化，只返回data对象
    // 获取用户数据列表
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) return this.$message.error("获取用户列表失败！");
      this.userlist = res.data.users;
      this.total = res.data.total;
      console.log(res);
    },
    // handleSizeChange为pagesize发生改变时的相应监听函数，
    // handleCurrentChange为currentPage发生改变时的相应监听函数
    // 监听pagesize改变事件
    handleSizeChange(newSize) {
      //  console.log(newSize);
      this.queryInfo.pagesize = newSize;
      // pagesize发生变化之后立即重新发起ajax数据请求,来获取这一页的数据
      this.getUserList();
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.pagenum = newPage;
      // pagenum发生变化之后重新发起ajax请求,来获取这一页的数据
      this.getUserList();
    },
    // 监听switch开关的状态的改变
    // 思路: 1.监听到switch状态的改变 element中api提供,switch状态发生变化时的回调函数change
    //       2.调用接口把最新的状态提交到数据库中
    async userStateChange(userinfo) {
      // 拿到最新状态
      // console.log(userinfo);
      // users/:uId/state/:type
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        // 用户更新失败后,重置原来状态
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户状态失败!");
      }
      this.$message.success("更新用户状态成功!");
    },
    // 实线搜索框的功能
    // 思路:1.文本框和data中的数据进行数据双向绑定
    //      2.点击搜索按钮之后,调用获取用户列表的函数,进行查询

    // 实现添加用户的功能
    // 思路：1.运用到element中Dialog对话框，弹出层
    /* Dialog对话框功能：在保留当前页面状态的情况下，告知用户并承载相关操作。 */

    // 监听添加用户对话框的关闭
    // 无法清空的问题？

    //   获取DOM元素
    // 救命稻草, document.querySelector

    // 1: 在template中标识元素 ref=“xxxx”

    // 2: 在要获取的时候, this.$refs.xxxx 获取元素

    // 创建组件,装载DOM,用户点击按钮

    // ref在DOM上获取的是原生DOM对象

    // ref在组件上获取的是组件对象

    // $el 是拿其DOM
    addDialogClosed() {
      // resetFields，对整个表单进行重置，
      // 将所有字段值重置为初始值并移除校验结果
      // resetFields：对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
      this.$refs.addFormRef.resetFields();
    },
    // 添加用户的预验证
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return fasle;
        // if (valid) {
        //   alert("submit!");
        // } else {
        //   console.log("error submit!!");
        //   return false;
        // }
        // 可以发送添加用户的网络请求
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status !== 201) return this.$message.error("添加用户失败");
        this.$message.success("添加用户成功");
        // 隐藏添加用户的对话框
        this.addDialogVisible = false;
        // 重新发起请求用户列表
        this.getUserList();
      });
    },
    // 展示编辑用户对话框
    async showEditDialog(id) {
      // console.log(id);
      // 根据传进来id，调用api接口查询用户信息
      const { data: res } = await this.$http.get("users/" + id);
      // if (res.meta.status !== 200) return this.$message.error("查询用户信息失败");
      this.editDialogVisible = !this.editDialogVisible;
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户信息失败");
      } else {
        return (this.editForm = res.data);
      }
      // this.editDialogVisible = !this.editDialogVisible;
      // 查询到的信息保存到editForm中
      // this.editForm = res.data;
      // this.editDialogVisible = !this.editDialogVisible;
    },
    // 实现修改表单的关闭之后的重置操作
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },

    // 提交修改之前的表单预验证操作
    editUserInfo() {
      // 对整个表单进行校验的方法，参数为一个回调函数
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return fasle;
        // 验证通过后发起数据请求

        // 提交服务器的数据
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新用户信息失败！");
        } else {
          // 关闭对话框
          this.editDialogVisible = false;
          // 刷新数据列表
          this.getUserList();
          // 提示更新用户信息成功
          this.$message.success("更新用户信息成功！");
        }
      });
    },

    // 根据id删除对应的用户信息
    async removeUserById(id) {
      // console.log(row);
      // console.log(object);
      // 先弹出询问用户是否删除数据
      // 返回回的是promise对象，用await async优化
      const comfirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => {
        return err;
      });
      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult)
      console.log(comfirmResult);
      if (comfirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败！");
      }
      this.$message.success("删除用户成功！");
      this.getUserList();
    },

    // 展示分配角色对话框
    async setRole(userinfo) {
      // 展示分配角色对话框对话之前获取所有角色的列表
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！");
      }
      this.rolesList = res.data;

      // 拿到userinfo保存到data中，以供我们使用
      this.userInfo = userinfo;
      // console.log(this.userInfo);
      this.setRoleDialogVisible = true;
    },

    // 点击确定按钮分配角色
    async saveRoleInfo() {
      // 先判定用户是否选择新的角色
      if (!this.selectedRoleId) {
        return this.$message.error("请选择要分配的角色");
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("更新角色失败！");
      }
      this.$message.success("更新角色成功!");
      // 刷新用户列表
      this.getUserList();
      // 关闭对话框
      this.setRoleDialogVisible = false;
    },
    // 监听分配角色的对话框的关闭事件
    setRoleDialogClosed() {
      this.selectedRoleId = "";
      this.userInfo = {};
    }
  }
};
</script>

<style lang="less" scoped>
</style>
