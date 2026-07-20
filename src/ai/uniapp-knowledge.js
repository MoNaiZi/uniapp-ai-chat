/**
 * uni-app 核心知识库（精简版）
 */
const UNIAPP_KNOWLEDGE = `uni-app核心API：
页面跳转: uni.navigateTo({url:'/pages/xxx/xxx'})保留当前页; uni.redirectTo关闭当前页; uni.switchTab跳tabBar; uni.reLaunch重启; uni.navigateBack({delta:1})返回; 传参:url后加?id=1&name=abc; 接收:onLoad(opt){}里opt.id取参。
生命周期: onLoad,onShow,onReady,onHide,onUnload,onPullDownRefresh,onReachBottom。
请求: const[err,res]=await uni.request({url,method,data,header})。
存储: uni.setStorageSync('k','v'); uni.getStorageSync('k')。
Toast: uni.showToast({title:'',icon:'none'})。
模板: v-model双向绑定 v-if条件 v-for循环 @click事件 :key必须。
导出: export default { data(){return{}}, methods:{}, onLoad(){} }。`;

export default UNIAPP_KNOWLEDGE;
