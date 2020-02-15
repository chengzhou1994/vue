import Vue from "vue";
// 按需导入elment-ui中的组件
// 导入elment-ui中的弹框提示组件
import {
  Button,
  Form,
  FormItem,
  Input,
  Message,
  Container,
  Header,
  Aside,
  Main,
  Menu,
  Submenu,
  MenuItem,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Row,
  Col,
  Table,
  TableColumn,
  Switch,
  Tooltip,
  Pagination,
  Dialog,
  MessageBox,
  Tag
} from "element-ui";
// 使用Vue.use全局注册组件
Vue.use(Button);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.use(Container);
Vue.use(Header);
Vue.use(Aside);
Vue.use(Main);
Vue.use(Menu);
Vue.use(Submenu);
Vue.use(MenuItem);
Vue.use(Breadcrumb);
Vue.use(BreadcrumbItem);
Vue.use(Card);
Vue.use(Row);
Vue.use(Col);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Switch);
Vue.use(Tooltip);
Vue.use(Pagination);
Vue.use(Dialog);
Vue.use(Tag);
// Element 为 Vue.prototype 添加了全局方法 $message。
// 弹框提示组件挂载到vue的原型上的属性起个名字message，每个组件可以用this调用$message,即this.$message
Vue.prototype.$message = Message;
// 全局挂载MessageBox中方法
Vue.prototype.$confirm = MessageBox.confirm;
