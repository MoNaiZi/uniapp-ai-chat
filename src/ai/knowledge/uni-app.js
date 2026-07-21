/**
 * uni-app 知识库
 * 类别: uni-app-doc | components | errors | best-practices
 */

const UNIAPP_CHUNKS = [
  // ==================== uni-app 官方文档 ====================
  {
    id: "uniapp-route",
    category: "uni-app-doc",
    title: "uni-app 页面路由",
    keywords: [
      "路由",
      "跳转",
      "navigateTo",
      "redirectTo",
      "switchTab",
      "reLaunch",
      "navigateBack",
      "页面",
      "传参",
      "onLoad",
    ],
    content: `页面路由API：
- uni.navigateTo({url:'/pages/xxx/xxx?id=1'}) 保留当前页跳转，可返回。目标页 onLoad(opt) 中 opt.id 接收参数。
- uni.redirectTo({url}) 关闭当前页跳转，不可返回。
- uni.switchTab({url}) 跳转到 tabBar 页面，关闭其他非 tabBar 页。
- uni.reLaunch({url}) 关闭所有页面，打开新页面。
- uni.navigateBack({delta:1}) 返回上一页，delta 为返回层数。
- 路由传参用 URL query 形式，接收方在 onLoad(options) 中取。
- 传递复杂对象用 encodeURIComponent(JSON.stringify(obj)) 编码。`,
  },
  {
    id: "uniapp-lifecycle",
    category: "uni-app-doc",
    title: "uni-app 页面生命周期",
    keywords: [
      "生命周期",
      "onLoad",
      "onShow",
      "onReady",
      "onHide",
      "onUnload",
      "onPullDownRefresh",
      "onReachBottom",
      "页面",
    ],
    content: `页面生命周期执行顺序：
1. onLoad(opt) - 页面加载，只调一次，接收路由参数
2. onShow() - 页面显示，每次进入都会调
3. onReady() - 页面初次渲染完成，只调一次
4. onHide() - 页面隐藏（切换到后台/跳转其他页）
5. onUnload() - 页面卸载（redirectTo/reLaunch/navigateBack 关闭时）

下拉刷新：onPullDownRefresh()，需在 pages.json 中配置 enablePullDownRefresh:true
触底加载：onReachableBottom()，距离底部 50px 触发`,
  },
  {
    id: "uniapp-vue-lifecycle",
    category: "uni-app-doc",
    title: "Vue 组件生命周期",
    keywords: [
      "生命周期",
      "beforeCreate",
      "created",
      "beforeMount",
      "mounted",
      "beforeUpdate",
      "updated",
      "beforeUnmount",
      "unmounted",
      "beforeDestroy",
      "destroyed",
      "挂载",
      "DOM",
      "初始化",
      "组件",
    ],
    content: `Vue 组件生命周期钩子（按执行顺序）：
1. beforeCreate - 实例初始化后，数据观测/事件配置前。极少使用。
2. created - 实例创建完成，数据响应式/计算属性/方法已配好，DOM 未生成。适用：异步请求数据、初始化非响应式变量。
3. beforeMount - 挂载开始前，render 函数首次调用前。极少使用。
4. mounted - 组件挂载到 DOM 后，$el 可用。适用：操作 DOM、初始化第三方库（图表等）、绑定事件监听。
5. beforeUpdate - 数据变化后，DOM 重渲染前。适用：在更新前访问现有 DOM、移除事件监听。
6. updated - 数据变化导致 DOM 重渲染完成后。适用：操作更新后 DOM（注意避免死循环）。
7. beforeUnmount (Vue3) / beforeDestroy (Vue2) - 组件卸载前，实例仍完全可用。适用：清理定时器、取消订阅、移除事件监听。
8. unmounted (Vue3) / destroyed (Vue2) - 组件卸载完成后。适用：最后清理工作。

注意：uni-app 页面还有额外生命周期 onLoad/onShow/onReady/onHide/onUnload，与 Vue 组件生命周期是两套独立的体系。`,
  },
  {
    id: "uniapp-request",
    category: "uni-app-doc",
    title: "uni-app 网络请求",
    keywords: [
      "请求",
      "request",
      "api",
      "接口",
      "网络",
      "uploadFile",
      "download",
      "header",
      "响应",
      "拦截器",
      "封装",
    ],
    content: `网络请求：
- uni.request({url, method, data, header, timeout}) 发起请求。返回 [err, res] 格式。
- uni.uploadFile({url, filePath, name, formData}) 上传文件。
- uni.downloadFile({url}) 下载文件。
- 推荐封装：const [err, res] = await uni.request({...}); if(err) return uni.showToast({title:'请求失败',icon:'none'});
- 全局请求拦截：在 App.vue 中通过拦截器统一处理 token、错误码。
- 注意：本地测试需配置 devServer proxy 解决跨域。`,
  },
  {
    id: "uniapp-storage",
    category: "uni-app-doc",
    title: "uni-app 数据缓存",
    keywords: [
      "存储",
      "缓存",
      "storage",
      "setStorageSync",
      "getStorageSync",
      "removeStorageSync",
      "clearStorage",
      "数据",
      "本地",
    ],
    content: `数据缓存 API：
- uni.setStorageSync('key', value) 同步写入。value 可以是对象，自动序列化。
- uni.getStorageSync('key') 同步读取。无值返回空字符串。
- uni.removeStorageSync('key') 移除指定 key。
- uni.clearStorageSync() 清除所有缓存。
- 异步版本：uni.setStorage({key,data}) / uni.getStorage({key}) 性能更好。
- 缓存限制约 10MB，不适合存大文件。敏感数据勿存明文。`,
  },
  {
    id: "uniapp-ui",
    category: "uni-app-doc",
    title: "uni-app UI 交互",
    keywords: [
      "toast",
      "showToast",
      "showModal",
      "showLoading",
      "弹窗",
      "提示",
      "loading",
      "交互",
      "下拉刷新",
    ],
    content: `UI 交互 API：
- uni.showToast({title,icon:'none'/'success',duration}) 轻提示。
- uni.hideToast() 隐藏提示。
- uni.showModal({title,content,confirmText}) 模态对话框。
- uni.showLoading({title}) / uni.hideLoading() 加载中提示。
- uni.showActionSheet({itemList}) 底部操作菜单。
- 注意：showToast 和 showLoading 互斥，同一时间只能显示一个。`,
  },
  {
    id: "uniapp-vue-syntax",
    category: "uni-app-doc",
    title: "Vue.js 模板语法",
    keywords: [
      "模板",
      "v-model",
      "v-if",
      "v-for",
      "v-show",
      "v-bind",
      "@click",
      "事件",
      "计算属性",
      "computed",
      "watch",
      "指令",
    ],
    content: `Vue 模板语法：
- v-model 双向绑定表单元素（input/textarea/select/picker等）。
- v-if / v-else-if / v-else 条件渲染（DOM 销毁重建）。
- v-show 按 display:none 控制显隐（频繁切换用这个）。
- v-for="(item,index) in list" :key="item.id" 列表渲染，:key 必须唯一。
- v-bind:attr（缩写 :attr）动态绑定属性。
- v-on:event（缩写 @event）绑定事件，如 @click, @input, @change。
- computed 计算属性，有缓存，依赖变化才重新计算。
- watch 监听数据变化执行异步操作或复杂逻辑。`,
  },
  {
    id: "uniapp-component",
    category: "uni-app-doc",
    title: "uni-app 组件基础",
    keywords: [
      "组件",
      "component",
      "props",
      "$emit",
      "插槽",
      "slot",
      "注册",
      "ref",
      "通信",
    ],
    content: `组件用法：
- 定义：export default { props:['title'], emits:['update'], methods:{...} }
- 父传子：<child :title="data" />
- 子传父：this.$emit('update', value)，父组件 @update="handleUpdate"
- 插槽：<slot /> 默认插槽，<slot name="footer" /> 具名插槽。
- ref 引用：<child ref="c" />，this.$refs.c 获取组件实例。
- 全局注册：app.component('name', Component)
- 局部注册：components: { Child } 在页面/组件内。`,
  },
  {
    id: "uniapp-config",
    category: "uni-app-doc",
    title: "uni-app 项目配置",
    keywords: [
      "配置",
      "pages.json",
      "manifest.json",
      "条件编译",
      "tabBar",
      "pages",
      "分包",
      "导航栏",
    ],
    content: `项目配置：
- pages.json 配置页面路由、tabBar、窗口样式、分包等。
- manifest.json 配置应用名称、图标、权限、sdk 等。
- 条件编译：#ifdef H5 / #ifdef MP-WEIXIN / #ifndef 用于跨平台差异代码。
- tabBar 配置：list 中 pagePath、text、iconPath、selectedIconPath。
- 分包：subPackages 字段配置分包路径，减小首包体积。
- 导航栏：pages.style.navigationBarTitleText 设置标题。`,
  },

  // ==================== 组件库 ====================
  {
    id: "comp-list",
    category: "components",
    title: "uni-app 内置组件列表",
    keywords: [
      "组件",
      "view",
      "text",
      "image",
      "scroll-view",
      "swiper",
      "input",
      "button",
      "video",
    ],
    content: `uni-app 内置常用组件：
- <view> 容器，类似 div。支持 hover-class 按下的样式类。
- <text> 文本，支持 selectable 可选、space 空格处理。
- <image> 图片，src 属性支持本地和网络路径，mode 控制裁剪模式。
- <scroll-view> 可滚动区域，scroll-y 纵向滚动，@scrolltolower 触底事件。
- <swiper>/<swiper-item> 轮播图，autoplay/interval/circular 控制。
- <input> 输入框，type 支持 text/number/idcard/digit。
- <button> 按钮，open-type 可调用分享、获取用户信息等。`,
  },
  {
    id: "comp-form",
    category: "components",
    title: "uni-app 表单组件",
    keywords: [
      "表单",
      "form",
      "picker",
      "radio",
      "checkbox",
      "switch",
      "slider",
      "textarea",
      "选择器",
      "校验",
    ],
    content: `表单组件：
- <form @submit="onSubmit"> 表单容器，report-submit 收集 formId。
- <picker mode="selector/date/time/region" @change="onChange"> 选择器。
- <radio-group>/<radio> 单选，<checkbox-group>/<checkbox> 多选。
- <switch checked @change> 开关。
- <slider min max value @change> 滑动条。
- <textarea> 多行输入，auto-height 自适应高度。
- 表单校验：在 @submit 回调中用 uni.showToast 提示校验结果。`,
  },

  // ==================== 错误案例 ====================
  {
    id: "err-this-scope",
    category: "errors",
    title: "箭头函数 this 指向问题",
    keywords: [
      "this",
      "箭头函数",
      "作用域",
      "undefined",
      "错误",
      "bug",
      "回调",
      "function",
    ],
    content: `错误：在普通 function 回调中使用 this 报 undefined。
解决：用箭头函数保持外层 this。
// 错误
setTimeout(function(){ this.data = 1; }) // this 指向 window
// 正确
setTimeout(() => { this.data = 1; })     // this 指向 Vue 实例

uni.request 等 API 回调中同理，都用箭头函数。`,
  },
  {
    id: "err-vfor-key",
    category: "errors",
    title: "v-for 缺少 :key",
    keywords: ["v-for", "key", "列表", "报错", "警告", "渲染", "重复"],
    content: `错误：v-for 未绑定 :key，导致列表更新异常。
解决：必须加 :key 且用唯一值（如 item.id），不要用 index 作为 key。
// 错误
<view v-for="item in list">{{item.name}}</view>
// 正确
<view v-for="item in list" :key="item.id">{{item.name}}</view>

用 index 做 key 在增删列表项时会导致渲染错乱。`,
  },
  {
    id: "err-async-data",
    category: "errors",
    title: "异步数据未处理空状态",
    keywords: [
      "异步",
      "数据",
      "null",
      "undefined",
      "空状态",
      "接口",
      "加载",
      "渲染",
      "白屏",
    ],
    content: `错误：页面渲染时数据未返回，访问 undefined 属性导致白屏。
解决：
1. 数据加默认值：data() { return { list: [] } }
2. 模板判空：<view v-if="list.length"> 或 <view v-if="obj && obj.name">
3. 加载状态：定义一个 loading 变量，请求前 true，请求后 false
4. 错误处理：请求失败给默认值，别让页面崩掉`,
  },
  {
    id: "err-route-param",
    category: "errors",
    title: "路由传参对象丢失",
    keywords: [
      "路由",
      "传参",
      "参数",
      "对象",
      "丢失",
      "encodeURIComponent",
      "JSON",
    ],
    content: `错误：路由跳转传递对象时，目标页只能收到 [object Object]。
解决：对象参数必须序列化。
// 跳转页
uni.navigateTo({
  url: '/pages/detail?data=' + encodeURIComponent(JSON.stringify(obj))
})
// 接收页
onLoad(opt) {
  this.detail = JSON.parse(decodeURIComponent(opt.data));
}

注意 URL 长度限制，大数据量建议用全局变量或缓存传递。`,
  },
  {
    id: "err-pages-json",
    category: "errors",
    title: "页面未在 pages.json 注册",
    keywords: [
      "pages.json",
      "注册",
      "页面",
      "404",
      "找不到",
      "路由",
      "配置",
      "报错",
    ],
    content: `错误：navigateTo 跳转后报"页面不存在"，新页面未在 pages.json 中注册。
解决：在 pages.json 的 pages 数组中添加新页面路径。
{
  "pages": [
    { "path": "pages/index/index" },
    { "path": "pages/detail/detail" }  // 必须注册
  ]
}

如果用了分包，确认路径在 subPackages 中正确配置。`,
  },
  {
    id: "err-style-scoped",
    category: "errors",
    title: "样式 scoped 穿透问题",
    keywords: [
      "样式",
      "scoped",
      "穿透",
      "deep",
      "子组件",
      "覆盖",
      "CSS",
      "style",
    ],
    content: `错误：父组件样式无法影响子组件内部元素，因为 Vue scoped 隔离。
解决：用 :deep() 深度选择器穿透。
// 父组件样式
<style scoped>
.parent :deep(.child-class) { color: red; }
</style>

或使用 /deep/（已废弃不推荐）或全局样式（去掉 scoped）。uni-app 中推荐 :deep()。`,
  },

  // ==================== 最佳实践 ====================
  {
    id: "best-api-encap",
    category: "best-practices",
    title: "API 请求封装最佳实践",
    keywords: [
      "封装",
      "api",
      "请求",
      "拦截",
      "token",
      "baseUrl",
      "统一",
      "request",
      "封装请求",
      "拦截器",
    ],
    content: `推荐封装 uni.request 为统一请求模块：
// utils/request.js
const BASE_URL = 'https://api.example.com';
export function request({url, method='GET', data={}}) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header: { 'Authorization': 'Bearer ' + uni.getStorageSync('token') },
      success: (res) => {
        if (res.statusCode === 200) resolve(res.data);
        else reject(res.data);
      },
      fail: (err) => reject(err)
    });
  });
}

这样所有页面的请求都走统一的 baseUrl、token 注入和错误处理逻辑。`,
  },
  {
    id: "best-import-optimize",
    category: "best-practices",
    title: "分包与按需加载",
    keywords: [
      "分包",
      "优化",
      "性能",
      "按需加载",
      "subPackages",
      "体积",
      "启动",
      "首屏",
    ],
    content: `性能优化关键点：
1. 主包只放首页和公共资源，其余页面放分包（subPackages）。
2. 组件异步加载：import { defineAsyncComponent } from 'vue'。
3. 图片用 CDN，不用本地大图。小图标用 iconfont。
4. 静态资源（CSS/JS）压缩，开启 gzip。
5. 路由懒加载：component: () => import('@/pages/xxx.vue')。
6. 数据预加载：uni.preloadPage 提前加载下一页资源。
7. 避免在 onLoad 中做大量同步运算，用 setTimeout 分片。`,
  },
  {
    id: "best-state-mgmt",
    category: "best-practices",
    title: "状态管理与全局数据",
    keywords: [
      "状态管理",
      "全局",
      "Vuex",
      "Pinia",
      "跨页面",
      "数据",
      "共享",
      "store",
      "getApp",
    ],
    content: `跨页面数据共享方案：
1. 简单场景：getApp().globalData = { userInfo: {} }，其他页面 getApp().globalData.userInfo。
2. 复杂场景用 Pinia（Vue3 推荐）或 Vuex。
3. Pinia 基本用法：
   // stores/user.js
   import { defineStore } from 'pinia';
   export const useUserStore = defineStore('user', {
     state: () => ({ info: null }),
     actions: { async login() { this.info = await api.login(); } }
   });
4. 页面间传参过大时（如列表页数据给详情页），用全局状态代替路由传参。`,
  },
  {
    id: "best-error-handle",
    category: "best-practices",
    title: "错误处理与用户反馈",
    keywords: [
      "错误处理",
      "异常",
      "try",
      "catch",
      "提示",
      "兜底",
      "空白页",
      "重试",
    ],
    content: `错误处理最佳实践：
1. 所有 async/await 用 try/catch 包裹。
2. 统一错误页：pages/error/error.vue 作为兜底展示。
3. 网络异常提示："network error" → showToast('网络异常，请稍后重试')
4. 空数据展示：列表无数据时显示"暂无数据"占位图而非空白。
5. 表单校验在前端做一道，后端做第二道。校验不通过用 showToast 提示具体字段。
6. 关键操作（如支付）加二次确认 showModal。
7. 页面级 loading：onLoad 中 showLoading，数据回来后 hideLoading。`,
  },
  {
    id: "best-project-structure",
    category: "best-practices",
    title: "项目目录结构建议",
    keywords: [
      "目录",
      "结构",
      "组织",
      "pages",
      "components",
      "utils",
      "api",
      "store",
      "static",
    ],
    content: `推荐 uni-app 项目目录结构：
├── pages/           # 页面
│   ├── index/       # 首页
│   └── detail/       # 详情
├── components/       # 公共组件
├── api/              # 接口请求模块
│   └── user.js       # 按业务拆分 api 文件
├── store/            # 状态管理 (Pinia)
├── utils/            # 工具函数
│   ├── request.js    # 请求封装
│   └── validate.js   # 校验函数
├── static/           # 静态资源（图片/CSS）
├── pages.json        # 页面配置
├── manifest.json     # 应用配置
└── App.vue           # 应用入口`,
  },
];

export { UNIAPP_CHUNKS };
