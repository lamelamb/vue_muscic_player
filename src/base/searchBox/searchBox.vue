<template>
	<div class="my-search-box">
	  <i class="icon-search"></i>
	  <input type="text" class="box" ref="queryRef" v-model="query" :placeholder="placeholder">
	  <i class="icon-dismiss" v-show="query" @click="clearQuery"></i>
	</div>
</template>

<script>
    import { myDOM } from '@/common/js/myutils.js'
    
    export default {
      components: {},
      data () {
        return {
          query: ''
        }
      },
      props: {
        placeholder: {
          type: String,
          default: '搜索歌曲、歌手'
        }
      },
      watch: {},
      filters: {},
      methods: {
         // 移动端input 聚焦可能出现虚拟键盘的bug 
        // 给父亲用的，让输入框失去焦点，避免滚动搜索结果时移动端键盘遮挡
        blur() {
          this.$refs.queryRef.blur()
        },
        // 给父亲用的，传进搜索框的值
        // this.$refs.searchBoxRef.getQuery(k)
        // 调用接口，添加历史。。。。
        getQuery(k) {
          this.query = k
        },
        clearQuery() {
          this.query = ''
        }
      },
      computed: {},
      created () {
        // 节流---对query 进行watch 和 写在watch 里面效果一致 
        // 这里 有一个this 指向问题 ，myDOM.debounce 返回一个匿名函数，这个匿名函数是普通函数
        // 相当于在watch 里面这样写 auery:function(){}, 这个函数内部的this 被指向了vue 实例
        // 对比下方的正常 setTimeout 中的匿名函数 ，this 应该是 window 
        this.$watch('query', myDOM.debounce((newQuery) => {
           this.$emit('query', newQuery)
         
        }, 800))
        
//       this.$watch('query', function(){
//           console.log(this)  // vue
//       })
        
       // setTimeout(function(){ console.log(this) }) // window
        
        
      },
      mounted () {},
      destroyed () {}
    }
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.my-search-box 
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  padding: 0 6px;
  height: 40px;
  background: $color-highlight-background;
  border-radius: 6px;
  .icon-search 
    font-size: 24px;
    color: $color-background;
  
  .box 
    flex: 1;
    margin: 0 5px;
    line-height: 18px;
    border: 0;
    outline: none;
    background: $color-highlight-background;
    color: $color-text;
    font-size: $font-size-medium;
    &::placeholder 
      color: $color-text-d;
    
  .icon-dismiss 
    font-size: 16px;
    color: $color-dialog-background;
  
</style>
