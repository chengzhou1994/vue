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
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!--  先放一个layout布局组件-->
            <el-row
              :class="['btbottom',i1 ===0 ? 'bttop':'btbottom','vccenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="18">
                <!-- 通过for循环渲染二级权限 -->
                <el-row
                  :class="['bttop',i2===0 ? '':'btbottom','vccenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
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
            >编辑</el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeRoleById(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              @close="showSetRightDialogClosed"
            >分配权限</el-button>
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

    <!--分配角色权限的对话框-->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%">
      <!--树形控件-->
      <!-- :data="数据源" prop指定数据绑定的字段，属性绑定对象，label看到的哪个属性对应的值，
      children: "children"是指父子节点通过哪个属性嵌套的-->
      <!-- 每个树节点用来作为唯一标识的属性，整棵树应该是唯一的 -->
      <!-- default-expand-all是否默认展开所有节点 -->
      <!-- show-checkbox节点是否可被选择 -->
      <!-- default-checked-keys 默认要勾选展示的节点，你得要提供一个array数组绑定过来就行了-->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        :default-expand-all="true"
        :default-checked-keys="defKeys"
      ></el-tree>
      <!--底部按钮区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRightDialogVisible = false">确 定</el-button>
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
      editForm: {},
      // 控制分配权限对话框的隐藏
      setRightDialogVisible: false,
      // 获取到的所有权限数据
      rightsList: [],
      // 树形控件的绑定对象
      treeProps: {
        label: "authName",
        children: "children"
      },
      // 默认选中地节点ID值数组
      defKeys: []
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
    },

    // 根据ID删除对应的权限
    async removeRightById(role, rightId) {
      // 弹窗提示用户确认是否删除
      // MessageBox 弹框
      //  console.log(role.id)
      // console.log(rightId)
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
          // 捕捉到用户的取消行为
        }
      ).catch(err => err);
      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消删除，则返回值为字符串 cancel

      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除");
      }
      // console.log("确认了删除");
      // 发起删除角色的请求
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) return this.$message.error("删除权限失败！");
      // this.getRolesList()
      role.children = res.data;
      // 此时点击权限标签的删除，已经可以实现功能。但是有个问题，删除以后重新发起请求角色列表，
      // 整个角色列表刷新，导致打开的权限被闭合了，查看接口文档，发现删除角色指定权限的接口，响应数据说明里指出，返回的data,
      // 是当前角色下最新的权限数据，所以可以直接使用这个data渲染权限列表：
    },

    async showSetRightDialog(role) {
      // 先获取所有权限
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败");
      }
      this.setRightDialogVisible = true;
      // 获取到的所有权限数据放到data中
      this.rightsList = res.data;
      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys);
      console.log(res);
    },

    // 把权限的id放入到defKeys数组中。
    // 点击分配权限按钮的同时，通过递归地形式，把当前角色已有的三级权限的id都放入到defKeys数组中。
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      // 节点数组
      // 如果当前node节点不包含children属性，则是三级权限节点
      if (!node.children) {
        return arr.push(node.id);
      }
      // 循环node里的children数组，每循环一项拿到一个子节点item，在根据item再次调用递归函数getLeafKeys，
      // 然后把当前的item当做一个节点传进去，同时把arr传进去。只要递归完毕后，就把三级节点的id都保存到arr了
      node.children.forEach(item => this.getLeafKeys(item, arr));
    },
    // 监听 分配权限对话框的关闭事件
    showSetRightDialogClosed() {
      this.defKeys = [];
    }
  }
};
</script>

<style lang="less" scoped>
.bttop {
  border-top: 1px solid #eee;
}
.btbottom {
  border-bottom: 1px solid #eee;
}
.vccenter {
  // flex布局
  display: flex;
  // 纵向居中对齐
  align-items: center;
}
</style>
