<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示警告区域 -->
      <el-alert title="添加商品信息" type="info" show-icon center></el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="300" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab页区域 -->
      <el-form
        :model="addForm"
        :rules="addFormrules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="tabPosition"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                :options="cateList"
                :props="cateProps"
                v-model="addForm.goods_cat"
                clearable
                @change="handleCateChanged"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTabData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 渲染静态属性 -->
            <el-form-item :label="item.attr_name" v-for="item in onlyTabData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 上传按钮 -->
            <!-- action 图片要上传请求的后台api接口,url是完整的api地址 -->
            <!-- list-type 指定当前文件列表的呈现的方式-->
            <!-- 这个el-upload组件自己封装的ajax,并没有携带token值和调用axios，所以要手动设置请求头 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <!-- bidirectional data binding（双向数据绑定） -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" class="previewImg" />
    </el-dialog>
  </div>
</template>
<script>
import _ from "lodash";
export default {
  data() {
    return {
      // 默认激活项索引
      // el-steps和el-tabs共用一个数据项 activeIndex
      activeIndex: "0",
      // tab底部
      tabPosition: "left",
      // 添加商品的数据对象
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        // 商品所属分类
        // 级联选择框双向绑定的数组
        goods_cat: [],
        // 图片数组
        pics: [],
        // 商品的具体描述介绍
        goods_introduce: "",
        attrs: []
      },
      // 验证规则
      addFormrules: {
        goods_name: [
          {
            required: true,
            message: "请输入商品名称",
            trigger: "blur"
          }
        ],
        goods_price: [
          {
            required: true,
            message: "请输入商品价格",
            trigger: "blur"
          }
        ],
        goods_number: [
          {
            required: true,
            message: "请输入商品数量",
            trigger: "blur"
          }
        ],
        goods_weight: [
          {
            required: true,
            message: "请输入商品重量",
            trigger: "blur"
          }
        ],
        goods_cat: [
          {
            required: true,
            message: "请选择商品分类",
            trigger: "blur"
          }
        ]
      },
      // 所有商品分类信息
      cateList: [],
      // 级联选择器的配置选项
      cateProps: {
        value: "cat_id", // 指定选中值的属性
        label: "cat_name", // 指定选中标签的名称
        children: "children", // 指定父子嵌套的属性
        expandTrigger: "hover" // 次级菜单的展开方式 click / hover
        // checkStrictly: true // 允许选择任意一级的选项
      },
      // 获取到的动态参数列表
      manyTabData: [],
      // 获取到的静态参数列表
      onlyTabData: [],
      // 上传的url地址
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      // 图片上传的header请求头对象 设置字段Authorization
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      previewPath: "",
      // 图片dialog对话框显隐
      previewVisible: false
      // 商品的具体描述
    };
  },
  created() {
    // 获取所有商品信息
    this.getCateList();
  },
  methods: {
    // 获取所有商品信息
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败失败！");
      }
      this.cateList = res.data;
      // console.log(this.cateList);
    },
    // 当绑定值变化时触发的事件
    handleCateChanged() {
      // 判断是否选择3级
      if (this.addForm.goods_cat.length !== 3) {
        // 将addForm.goods_cat数据清空重置
        this.addForm.goods_cat = [];
        return;
      }
      // console.log(this.addForm.goods_cat);
    },
    // 判断当前tab页是否选择3级商品分类
    // 切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换。
    beforeTabLeave(activeName, oldActiveName) {
      // console.log("即将离开的标签页名字是:" + oldActiveName);
      // console.log("即将进入的标签页名字是:" + activeName);
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类");
        return false;
      }
    },
    // tab页被选中时触发
    async tabClicked() {
      console.log(this.activeIndex);
      // 证明访问的是动态参数面板
      // 商品参数获取到的动态参数列表
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取动态参数列表失败！");
        }
        console.log(res.data);
        // 将字符串装换成数组
        res.data.forEach(element => {
          element.attr_vals =
            element.attr_vals.length === 0 ? [] : element.attr_vals.split(" ");
        });
        this.manyTabData = res.data;
      }
      // 商品属性获取到的静态参数列表
      if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取静态参数列表失败！");
        }
        console.log(res.data);
        this.onlyTabData = res.data;
      }
    },
    // 处理图片预览 点击文件列表中已上传的文件时的钩子
    handlePreview(file) {
      console.log(file);
      // 1.获取图片临时完整路径，保存到data中去
      this.previewPath = file.response.data.url;
      // 显示对话框
      this.previewVisible = true;
    },

    // 处理移除图片预览的操作 文件列表移除文件时的钩子
    handleRemove(file) {
      // 1.获取将要删除的图片临时路径
      const filePath = file.response.data.tmp_path;
      // 2.从pics的数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex(item => item.pic === filePath);
      // 3.调用数组的splic方法，把图片的信息对象，从pics数组中移除
      this.addForm.pics.splice(i, 1);
      // console.log(this.addForm);
    },
    // 监听文件上传成功时的钩子
    handleSuccess(response) {
      console.log(response);
      // 1.拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      // 2.将图片信息对象，push到pics数组中去
      this.addForm.pics.push(picInfo);
      // console.log(this.addForm);
    },
    // 添加商品
    add() {
      // console.log(this.addForm);
      // 预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error("请填写必要的表单项！");
        }
        // Lodash cloneDeep(obj)
        // var objects = [{ 'a': 1 }, { 'b': 2 }];
        // var deep = _.cloneDeep(objects);
        // console.log(deep[0] === objects[0]);
        // => false
        // addForm深拷贝一份，与原来完全不一样
        const form = _.cloneDeep(this.addForm);
        // 数组转换成字符串
        form.goods_cat = form.goods_cat.join(",");
        // 处理动态参数
        this.manyTabData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(",")
          };
          this.addForm.attrs.push(newInfo);
        });
        // 处理静态参数
        this.onlyTabData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          };
          this.addForm.attrs.push(newInfo);
        });
        form.attrs = this.addForm.attrs;

        console.log(form);

        // 执行添加表单的业务逻辑
        const { data: res } = await this.$http.post("goods", form);
        if (res.meta.status !== 201) {
          return this.$message.error("获取商品失败！");
        }

        this.$message.success("添加商品成功！");
        this.$router.push("/goods");
      });
    }
  },
  // 定义计算属性
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    }
  }
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
