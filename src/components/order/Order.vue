<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable>
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- table表格区域 -->
      <el-table :data="orderList" border stripe>
        <!-- 索引列  -->
        <!-- 如果需要显示索引，可以增加一列el-table-column，设置type属性为index即可显示从1开始的索引号。 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格(元)" width="95px"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="90px">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="140px"></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="140px">
          <template slot-scope="scope">{{scope.row.create_time | dataFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showBox"></el-button>
            <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <!-- layout 显示分页区页面布局结构 不建议动 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
      <!-- 修改地址对话框 -->
      <el-dialog
        title="修改地址"
        :visible.sync="addressVisible"
        width="50%"
        @close="addressDialogClosed"
      >
        <el-form
          :model="addressForm"
          :rules="addressFormRules"
          ref="addressFormRef"
          label-width="100px"
        >
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader :options="cityData" v-model="addressForm.address1" size="medium"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addressVisible = false">取消</el-button>
          <el-button type="primary" @click="addressVisible = false">确定</el-button>
        </span>
      </el-dialog>

      <!-- 展示物流进度对话框 -->
      <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
        <el-timeline>
          <!-- 时间线 -->
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time"
          >{{activity.context}}</el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import cityData from "./citydata";
export default {
  data() {
    return {
      queryInfo: {
        // 查询参数
        query: "",
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 10
      },
      // 获取到的所有订单数据
      orderList: [],
      // 总数据
      total: 0,
      // 控制修改地址对话框弹出层的显隐
      addressVisible: false,
      // 对话框的表单对象
      addressForm: {
        address1: [],
        address2: ""
      },
      // 验证规则数组
      addressFormRules: {
        address1: [
          {
            required: true,
            message: "请选择省市区县",
            // 鼠标失去焦点触发校验
            trigger: "blur"
          }
        ],
        address2: [
          {
            required: true,
            message: "请填写详细地址",
            // 鼠标失去焦点触发校验
            trigger: "blur"
          }
        ]
      },
      // 属性名和属性值重合的话简写cityData
      cityData: cityData,
      // 控制物流进度对话框的显隐
      progressVisible: false,
      // 物流信息数据
      progressInfo: []
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    // 获取所有订单数据
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取所有订单数据失败！");
      }
      this.$message.success("获取订单列表数据成功！");
      this.orderList = res.data.goods;
      this.total = res.data.total;
      console.log(res.data);
    },
    // handleSizeChange为pagesize发生改变时的相应监听函数，
    // handleCurrentChange为currentPage发生改变时的相应监听函数
    // 监听pagesize改变事件
    handleSizeChange(newSize) {
      //  console.log(newSize);
      this.queryInfo.pagesize = newSize;
      // pagesize发生变化之后立即重新发起ajax数据请求,来获取这一页的数据
      this.getOrderList();
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.pagenum = newPage;
      // pagenum发生变化之后重新发起ajax请求,来获取这一页的数据
      this.getOrderList();
    },
    // 展示修改地址的对话框
    showBox() {
      this.addressVisible = true;
    },
    // 对话框关闭事件 清空表单操作
    addressDialogClosed() {
      // this.addressForm.address1 = [];
      // this.addressForm.address2 = "";
      this.$refs.addressFormRef.resetFields();
    },
    // 展示进度对话框
    async showProgressBox() {
      this.progressVisible = true;
      const { data: res } = await this.$http.get("/kuaidi/804909574412544580");
      if (res.meta.status !== 200) {
        return this.$message.error("获取物流信息失败！");
      }
      console.log(res.data);
      this.progressInfo = res.data;
    }
  }
};
</script>

<style lang="less" scoped>
// 导入时间轴样式
@import "../../plugins/timeline/timeline.css";
@import "../../plugins/timeline-item/timeline-item.css";
.el-cascader {
  width: 100%;
}
</style>
