<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意:只允许为第三方分类设置相关参数" type="warning" :closable="false" show-icon></el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            :options="catList"
            :props="cateProps"
            v-model="selectCatKeys"
            @change="handleCatChanged"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- Tab页签区域 -->
      <!-- value / v-model绑定值，选中选项卡的 name -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isDisabled" @click="addParamsdialogVisible=true">添加参数</el-button>
          <!--动态参数表格 -->
          <el-table :data="manyTableData" style="width: 100%" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="item.index"
                  closable
                  @close="handleClose(index,scope.row)"
                >{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-editing"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deletedDialog(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加静态属性的面板-->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isDisabled" @click="addParamsdialogVisible=true">添加属性</el-button>
          <!--静态参数表格 -->
          <el-table :data="onlyTableData" style="width: 100%" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="item.index"
                  closable
                  @close="handleClose(index,scope.row)"
                >{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-editing"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deletedDialog(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addParamsdialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form ref="addFormref" :model="addForm" label-width="80px" :rules="addFormRules">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsdialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addParams">确定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editParamsdialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form ref="editFormref" :model="editForm" label-width="100px" :rules="editFormRules">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表.默认为空
      catList: [],
      //
      cateProps: {
        value: "cat_id", // 指定选中值的属性
        label: "cat_name", // 指定选中标签的名称
        children: "children", // 指定父子嵌套的属性
        expandTrigger: "hover" // 次级菜单的展开方式 click / hover
        // checkStrictly: true // 允许选择任意一级的选项
      },
      // 级联选择框双向绑定的数组
      selectCatKeys: [],
      // 默认激活的tab页
      activeName: "many",
      // 动态参数数据
      manyTableData: [],
      // 静态参数数据
      onlyTableData: [],
      // 控制添加参数对话框的显示
      addParamsdialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ""
      },
      // 验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },
      // 控制修改参数对话框的显示
      editParamsdialogVisible: false,
      // 修改的表单数据对象
      editForm: {},
      // 修改的表单验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    // 获取所有的商品分类数据
    this.getCateList();
  },
  methods: {
    // 获取所有的商品分类列表
    async getCateList() {
      // 不传参数的话默认3级目录，也可以写也可以不写
      const { data: res } = await this.$http.get("categories", {
        params: { type: 3 }
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取获取商品分类数据失败！");
      }
      console.log(res.data);
      this.catList = res.data;
    },
    // 级联选择框选中项变化，会触发这个函数
    handleCatChanged() {
      this.getParamsData();
    },

    // Tab点击事件的处理函数
    handleTabClick() {
      this.getParamsData();
      // console.log(this.activeName);
    },
    async getParamsData() {
      // 证明如果选中的不是三级目录
      if (this.selectCatKeys.length !== 3) {
        // 将selectCatKeys数据清空重置
        this.selectCatKeys = []; 
        // 将manyTableData数据清空重置
        this.manyTableData = [];
        // 将onlyTableData数据清空重置
        this.onlyTableData = [];
        return;
      }
      // 根据所选分类id 和当前所处的面板，获取对应的参数数据
      // cateID见计算属性
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表数据失败！");
      }
      // console.log(res.data);
      // 本来是字符串，经过forEach之后分割就变成了数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        // 给这个res.data添加inputVisible和inputValue属性
        // 为每一行提供单独的inputVisible和inputValue
        // 添加控制文本框的显示与隐藏
        item.inputVisible = false;
        // 添加文本框中输入的值
        item.inputValue = "";
      });
      console.log(res.data);
      // 先判断是哪个表格的数据many和only
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },
    // 监听添加参数对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormref.resetFields();
    },
    // 点击按钮，添加参数
    addParams() {
      this.$refs.addFormref.validate(async valid => {
        if (!valid) return false;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        );
        // console.log(res.data);
        if (res.meta.status !== 201) {
          return this.$message.error("添加参数失败！");
        }
        this.$message.success("添加参数成功！");
        this.addParamsdialogVisible = false;
        this.getParamsData();
      });
    },
    // 点击按钮编辑对话框.根据id查询
    async showEditDialog(id) {
      // 这是查询当前参数的信息
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          params: { attr_sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数信息失败！");
      }
      this.editForm = res.data;
      console.log(this.editForm);
      this.editParamsdialogVisible = true;
    },
    // 重置修改的表单
    editDialogClosed() {
      this.$refs.editFormref.resetFields();
    },
    // 点击确定按钮，修改参数并提交信息
    editParams() {
      this.$refs.editFormref.validate(async valid => {
        if (!valid) return false;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.editForm.attr_sel
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改参数信息失败！");
        }
        this.$message.success("修改参数信息成功！");
        this.getParamsData();
        this.editParamsdialogVisible = false;
      });
    },
    // 根据id删除对应项
    async deletedDialog(id) {
      // 返回的是文本
      const confirmResult = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除参数信息失败！");
      }
      this.$message.success("删除参数信息成功！");
      this.getParamsData();
    },
    // 文本框失去焦点，或按下了enter,都会触发事件
    async handleInputConfirm(row) {
      // trim() 方法用于删除字符串的头尾空白符。
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      // 如果没有return，则证明输入的内容，需要后续处理
      // 输入的值保存到attr_vals数组中去
      row.attr_vals.push(row.inputValue.trim());
      // 重置清空
      row.inputValue = "";
      // 隐藏
      row.inputVisible = false;
      // 需要发起请求保存这次参数
      this.saveAttrVals(row);
    },
    // 点击按钮展示文本输入框
    showInput(row) {
      row.inputVisible = true;
      // 让文本框自动获得焦点
      // $nextTick方法的作用，当页面上的元素（input没有被渲染出来之前）被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 将 attr_vals的操作保存到数据库中
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" ")
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("修改参数项失败！");
      }
      this.$message.success("修改参数项成功！");
    },
    // 删除对应的参数可选项
    handleClose(index, row) {
      row.attr_vals.splice(index, 1);
      this.saveAttrVals(row);
    }
  },

  // 计算属性
  computed: {
    // 如果按钮需要被禁用，则返回true,否则返回false
    // 证明选中的不是三级目录
    isDisabled() {
      if (this.selectCatKeys.length !== 3) {
        return true;
      }
      return false;
    },
    // 当前选中的三级分类id
    cateId() {
      if (this.selectCatKeys.length === 3) {
        return this.selectCatKeys[2];
      }
      return null;
    },
    // 动态计算标题的文本
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    }
  }
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin-top: 15px;
}
.el-tag {
  margin: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 120px;
  // margin-left: 10px;
  // vertical-align: bottom;
}
</style>
