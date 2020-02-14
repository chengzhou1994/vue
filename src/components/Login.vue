<template>
<div class="login_container">
    <div class="login_box">
        <!--头像区域 -->
        <div class="avatar_box">
            <img src="../assets/logo.png" alt srcset />
        </div>
        <!-- 表单登陆区域 -->
        <!--ref="loginFormRef" 表单的引用对象-->
        <el-form ref="loginFormRef" label-width="0px" class="login_form" :model="loginForm" :rules="loginFormRules">
            <!-- 用户名区域 -->
            <el-form-item prop="username">
                <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
            </el-form-item>
            <!-- 密码区域 -->
            <!-- 密码型输入框 -->
            <el-form-item prop="password">
                <el-input type="password" v-model="loginForm.password" prefix-icon="iconfont icon-3702mima"></el-input>
            </el-form-item>
            <!-- 按钮区域 -->
            <el-form-item class="btns">
                <el-button type="primary" @click='login'>登陆</el-button>
                <el-button type="info" @click='resetLoginForm'>重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</div>
</template>

<script>
export default {
  data () {
    return {
      // 这是登陆表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [{
          required: true,
          message: '请输登陆名称',
          // 鼠标失去焦点触发校验
          trigger: 'blur'
        },
        {
          min: 3,
          max: 10,
          message: '长度在3到10个字符',
          trigger: 'blur'
        }
        ],
        password: [{
          required: true,
          message: '请输登陆密码',
          trigger: 'blur'
        },
        {
          min: 3,
          max: 10,
          message: '长度在3到10个字符',
          trigger: 'blur'
        }
        ]
      }
    };
  },
  methods: {
    // 点击重置按钮，重置登陆表单
    // resetFields():对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
    resetLoginForm () {
      console.log(this);

      this.$refs.loginFormRef.resetFields();
    },
    // 登陆前的预校验，点击登录之前，不应该发起登陆网络请求，发起请求之前，
    // 要先对表单的数据进行预验证,通过之后才能发起网络登陆请求，否则提示用户，登陆数据不合法！
    // validate()对整个表单进行校验的方法，参数为一个回调函数。该回调函数会在校验结束后被调用，
    // 并传入两个参数：是否校验成功和未通过校验的字段。若不传入回调函数，则会返回一个 promise
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(valid);
        // 登陆前验证,提交数据是否正确
        if (!valid) return;
        // await ，async简化promise操作
        // data才是服务器返回的真实数据
        const { data: res } = await this.$http.post('login', this.loginForm);   

        if (res.meta.status !== 200) return this.$message.error('登陆失败！');

        this.$message.success('登录成功');
        
        // 1. 将登录成功之后的token,保存到客户端的sessionStorage 中
        //   1.1 项目中出了登录之外的其他API接口，必须在登录之后才能访问
        //   1.2 token 只应在当前网站打开期间生效，所以将token保存在 sessionStorage 中
        window.sessionStorage.setItem('token', res.data.token);
        // 2. 通过编程式导航跳转到后台主页，路由地址是 /home
        this.$router.push('/home');
      });
    } 
  }
};
</script>

<style lang="less" scoped>
.login_container {
    background-color: #2b4b6b;
    height: 100%;
}

.login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    // 圆角边框
    border-radius: 3px;
    // 绝对定位
    position: absolute;
    // 移动盒子居中
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box {
        // 设置盒子宽高
        height: 130px;
        width: 130px;
        // 给盒子添加边框线
        border: 1px solid #eee;
        // 盒子边框圆角线
        border-radius: 50%;
        // 设置边框与图片之间的间距
        padding: 10px;

        box-shadow: 0 0 10px #ddd;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;

        // 设置图片的宽高等于父盒子的宽高
        img {
            height: 100%;
            width: 100%;
            // 图片边框圆角线
            border-radius: 50%;
            background-color: #eee;
        }
    }
}

.login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    // 设置上下左右边距，上下0 左右10px
    padding: 0 10px;
    box-sizing: border-box;
}

.btns {
    // 按钮居右
    display: flex; //变成弹性盒模型
    justify-content: flex-end;
}
</style>
