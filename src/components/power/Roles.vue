<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <!-- Row 组件 提供 gutter 属性来指定每一栏之间的间隔，默认间隔为 0。 -->
        <!--el-row代表每一行 el-col代表每一列 span代表占多宽 一行有24个格子 每一格占6个-->
        <!-- 搜索添加区域 -->
        <!-- @click="addRolesDialog" -->
        <el-col>
          <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 添加边框线和隔行变色 -->
      <el-table :data="roleList" :border="true" :stripe="true">
        <!-- 展开列 -->
        <el-table-column type="expand"></el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeRoleById(scope.row.id)"
            ></el-button>
            <el-button type="warning" size="mini" icon="el-icon-setting"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框-->
    <!-- 设置visible属性，它接收Boolean 默认false -->
    <!-- close: Dialog 关闭的回调 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- dialog内容主体区 -->
      <!-- form -->
      <!-- :model="数据绑定对象" prop="验证规则字段" :rules="数据验证规则对象" ref="引用对象"-->
      <el-form :model="addform" ref="addRoleRef" :rules="addFormRules" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addform.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addform.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="addRole">确定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户角色的对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="角色名称">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="email">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editRoleInfo">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [], // 角色列表数据
      addDialogVisible: false, // 控制添加角色对话框是否显示
      editDialogVisible: false, // 控制修改角色对话框是否显示

      addform: {
        roleName: "",
        roleDesc: ""
      },
      addFormRules: {
        roleName: [
          {
            required: true,
            message: "请输入角色名",
            // 鼠标失去焦点触发校验
            trigger: "blur"
          },
          {
            min: 2,
            max: 10,
            message: "角色名的长度在2到10个字符之间",
            trigger: "blur"
          }
        ],
        roleDesc: [
          {
            required: true,
            message: "请输入角色描述",
            // 鼠标失去焦点触发校验
            trigger: "blur"
          },
          {
            min: 3,
            max: 10,
            message: "角色描述的长度在3到10个字符之间",
            trigger: "blur"
          }
        ]
      },
      editForm: {}
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色数据失败");
      }
      // this.$message.success("获取角色数据成功");
      this.roleList = res.data;
    },
    // 监听 添加用户角色对话框的关闭事件
    addDialogClosed() {
      this.$refs.addRoleRef.resetFields();
    },
    addRole() {
      this.$refs.addRoleRef.validate(async valid => {
        if (!valid) return false;
        // 可以发起添加角色的网络请求
        const { data: res } = await this.$http.post("roles", this.addform);
        if (res.meta.status !== 201) return this.$message.error("添加角色失败");
        // console.log(res);
        // this.$message.success("添加角色成功");
        // 隐藏添加角色的对话框
        this.addDialogVisible = false;
        // 重新发起请求角色列表
        this.getRolesList();
      });
    },
    // 根据ID查询角色
    async showEditDialog(id) {
      this.editDialogVisible = !this.editDialogVisible;
      const { data: res } = await this.$http.get("roles/" + id);
      //  console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户信息失败");
      }
      // 存数据到editForm
      this.editForm = res.data;
    },
    // 编辑角色对话框
    editRoleInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false;
        // 可以发起修改角色的网络请求
        const { data: res } = await this.$http.put(
          "roles/" + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改用户角色失败");
        } else {
          // 关闭对话框
          this.editDialogVisible = false;
          // 刷新数据列表
          this.getRolesList();
          // 提示更新用户信息成功
          this.$message.success("更新用户角色成功！");
        }
      });
    },
    async removeRoleById(id) {
      const comfirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
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
      // console.log(comfirmResult);
      if (comfirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败！");
      }
      this.$message.success("删除用户成功！");
      this.getRolesList();
    }
  }
};
</script>

<style lang="less" scoped>
</style>
