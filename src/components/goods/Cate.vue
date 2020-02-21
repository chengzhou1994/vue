<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类按钮区域 -->
      <el-row>
        <!-- Row 组件 提供 gutter 属性来指定每一栏之间的间隔，默认间隔为 0。 -->
        <!--el-row代表每一行 el-col代表每一列 span代表占多宽 一行有24个格子 每一格占6个-->
        <!-- 搜索添加区域 -->
        <!-- @click="addRolesDialog" -->
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        show-index
        :expand-type="false"
        border
        class="treetable"
      >
        <!-- 是否有效当前列模板  -->
        <!--表格中间定义自定义插槽, 插槽名称isok, slot-scoped接收这一行数据-->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen;"
          ></i>
          <i class="el-icon-error" style="color:red;" v-else></i>
        </template>
        <!-- 排序列当前列模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level ===0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level ===1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作列当前列模板 -->
        <template slot="operation" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 添加分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="addCateDialogClosed"
      >
        <el-form
          :model="addCateForm"
          ref="addCateFormRef"
          :rules="addCateFormRules"
          label-width="100px"
        >
          <el-form-item label="分类名称:" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类:">
            <!-- :options="parentCateList"用来指定级联选择器数据源 -->
            <!-- :props="cascaderProps" 用来指定配置对象-->
            <el-cascader
              :options="parentCateList"
              :props="cascaderProps"
              v-model="selectedKeys"
              @change="parentCatChanged"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询请求体，默认
      queryInfo: {
        type: 3,
        // 页码值
        pagenum: 1,
        // 每页显示的数据数目
        pagesize: 5
      },
      // 商品分类的数据列表,默认为空
      cateList: [],
      // 总数据条数 number型
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: "分类名称", // 列标题名称
          prop: "cat_name" // 对应列内容的属性名
        },
        {
          label: "是否有效",
          prop: "cat_deleted",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "isok"
        },
        {
          label: "排序",
          prop: "cat_level",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "order"
        },
        {
          label: "操作",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "operation"
        }
      ],
      // 控制添加分类的对话框显隐
      addCateDialogVisible: false,
      // 添加分类表单校验
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: "请输入分类名称",
            // 鼠标失去焦点触发校验
            trigger: "blur"
          }
        ]
      },
      // 添加分类的表单数据对象
      addCateForm: {
        // 分类父级 ID
        cat_pid: 0,
        // 将要添加的分类名称
        cat_name: "",
        // 分类层级 默认添加一级分类
        cat_level: 0
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器配置对象
      // 注意：是否允许选择任意一级的选项（例如只选第一级），
      // 以前版本的element是添加change-on-select，
      // 新版本是在props里添加checkStrictly: 'true'。
      cascaderProps: {
        value: "cat_id", // 指定选中值的属性
        label: "cat_name", // 指定选中标签的名称
        children: "children", // 指定父子嵌套的属性
        expandTrigger: "hover" // 次级菜单的展开方式 click / hover
        // checkStrictly: true // 允许选择任意一级的选项
      },
      // 选中的父级分类id,必须是数组
      selectedKeys: []
    };
  },
  created() {
    this.getCatelist();
  },
  methods: {
    // 获取商品分类数据列表
    async getCatelist() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取获取商品分类数据失败！");
      }
      // console.log(res.data);
      // 把商品分类数据列表数值给组件中的cateList
      this.cateList = res.data.result;
      // 总数据条数赋值给组件中的total
      this.total = res.data.total;
    },
    // handleSizeChange为pagesize发生改变时的相应监听函数，
    // handleCurrentChange为currentPage发生改变时的相应监听函数
    // 监听pagesize改变事件
    handleSizeChange(newSize) {
      //  console.log(newSize);
      this.queryInfo.pagesize = newSize;
      // pagesize发生变化之后立即重新发起ajax数据请求,来获取这一页的数据
      this.getCatelist();
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.pagenum = newPage;
      // pagenum发生变化之后重新发起ajax请求,来获取这一页的数据
      this.getCatelist();
    },
    showAddCateDialog() {
      // 先获取父级分类列表数据
      this.getParentCateList();
      // 再展示对话框
      this.addCateDialogVisible = true;
    },
    // 获取父级分类列表,因为只有3级层次,故只需要前2级
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级商品分类数据失败！");
      }
      // console.log(res.data);
      // 获取到的数据保存到data中,供页面使用
      this.parentCateList = res.data;
    },
    // 选择项发生变化触发事件@change
    parentCatChanged() {
      console.log(this.selectedKeys);
      // 如果 selectedKeys 数据中的 length 大于0，则证明选中了父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 选择最后一项当作父分类ID赋值。最后一项索引
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        // 为当前要添加的分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        // 父分类ID赋值
        this.addCateForm.cat_pid = 0;
        // 为当前要添加的分类的等级赋值
        this.addCateForm.cat_level = 0;
      }
      // console.log(this.addCateForm);
    },
    // 监听添加分类对话框的关闭事件
    addCateDialogClosed() {
      // 表单内容重置为空
      this.$refs.addCateFormRef.resetFields(); // 通过ref引用调用resetFields方法
      // 选中的父级分类的ID数组 重置为空
      this.selectedKeys = [];
      // 父分类id 和 当前分类等级 重置为空
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    // 点击按钮，添加新的分类
    addCate() {
      // console.log(this.addCateForm);
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return false;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加商品分类失败");
        }
        this.$message.success("添加商品分类成功");
        this.addCateDialogVisible = false;
        this.getCatelist();
      });
    }
  }
};
</script>

<style lang="less" scoped>
.treetable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
