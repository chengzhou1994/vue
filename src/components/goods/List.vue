<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- table表格区域 -->
      <el-table :data="goodsList" border stripe>
        <!-- 索引列  -->
        <!-- 如果需要显示索引，可以增加一列el-table-column，设置type属性为index即可显示从1开始的索引号。 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="140px">
          <template slot-scope="scope">{{scope.row.add_time | dataFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <div>
              <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-delete"
                @click="removeById(scope.row.goods_id)"
              ></el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <!-- layout 显示分页区页面布局结构 不建议动 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取商品列表的参数对象
      queryInfo: {
        // 查询参数
        query: "",
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 10
      },
      // 商品列表数据
      goodsList: [],
      total: 0
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    // 获取商品列表数据
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
      }
      this.$message.success("获取商品列表数据成功！");
      this.goodsList = res.data.goods;
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
      this.getGoodsList();
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.pagenum = newPage;
      // pagenum发生变化之后重新发起ajax请求,来获取这一页的数据
      this.getGoodsList();
    },
    // 根据ID删除商品
    async removeById(id) {
      const comfirmResult = await this.$confirm(
        "此操作将永久删除该数据, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => {
        return err;
      });
      if (comfirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete(`goods/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("删除数据失败！");
      }
      this.$message.success("删除数据成功！");
      this.getGoodsList();
    },
    goAddpage() {
      // 编程式的导航跳转路由
      this.$router.push('/goods/add');
    }
  }
};
</script>

<style lang="less" scoped>
</style>
