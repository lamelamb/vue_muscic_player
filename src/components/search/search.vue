<!-- 搜索页组件 -->

<template>
  <div class="my-search"> 
     <div class="search-box-wrapper">
          <search-box ref="searchBoxRef" @query="onQueryChange"></search-box>
     </div>
     
     <div class="shortcut-wrapper" v-show="!query" ref="shortcutRef">
           <scroll class="shortcut" ref="scrollRef" :data="scrollData" :refreshDelay="refreshDelay">
             <div>
               <!-- 热门搜索 -->
               <div class="hot-key">
                 <h1 class="title">热门搜索</h1>
                 <!-- <div class="item special">{{ hotkey.special_key }}</div> -->
                 <ul>
                   <li class="item" v-for="item in hotkey" @click="addQuery(item.k)">
                     <span>{{ item.k }}</span>
                   </li>
                 </ul>
               </div>
               <!-- 搜索历史 -->
               <div class="search-history" v-show="searchHistory.length">
                 <h1 class="title">
                   <span class="text">搜索历史</span>
                   <span class="clear" @click="showConfirm">
                     <i class="icon-clear"></i>
                   </span>
                 </h1>
                 <!-- 
                     确认所需要的数据，有2个功能 ，这些功能需要操控数据，自己不做，只是通过事件
                     通知父元素进行数据操作，然后数据改变，prop 改变自己重新渲染 -- 完成通信
                   这样就接触了自身功能和全局或者父级数据的耦合
                   可以直接调用 action
                  -->
                 <search-list :searches="searchHistory" @select="addQuery" @delete="delHistory"></search-list>
               </div>
             </div>
           </scroll>
       </div>
       
       <!-- 搜索结果 -->
      <div class="search-result" ref="resultRef" v-show="query">
                  <suggest-List ref="suggestRef"
                          :query="query"
                          :zhida="zhida"
                          @beforeScroll="blurInput"
                          @select="savaHis">
                  </suggest-List>
       </div>
       
       <!-- 清空弹窗 -->
       <my-confirm ref="confirmRef" @confirm="confirm" @cancel="cancel"></my-confirm>
       
       <router-view></router-view>
  </div>
</template>

<script>
 
import searchBox from '@/base/searchBox/searchBox'
import suggestList from '@/components/suggestList/suggestList'
import searchList from '@/base/searchList/searchList'
import MyConfirm from '@/base/MyConfirm/MyConfirm'
import scroll from '@/base/scroll/scroll'
import { getHotKey ,  search } from '@/api/search.js'
import { mapActions, mapGetters } from 'vuex'
import { playlistMixin } from '@/common/js/mixin.js'

export default {
  mixins: [playlistMixin],
  components: {
     searchBox,
     searchList,
     suggestList,
    MyConfirm,
    scroll
  },
  data () {
    return {
      // 热门搜索关键词
      hotkey: [],
      // 搜索字段 (my-search-box -> my-search -> my-suggest-List)
      query: '',
      // 是否显示歌手
      zhida: true,
      // 凡是在scroll 内部用到动画的都要保证scroll 能正确计算高度--- 在动画完成时间后再计算高度 
      // 我们设置在serachList ,myplayList 设置的动画都是0.1 s 
      refreshDelay: 100
    }
  },
  props: {},
  watch: {
    // 解决添加歌曲后不能滚动的问题--- 让scroll 重新计算高度，输入框变化后，要刷新scroll
    // 因为当我们改变 query 的时候，query 有值，显示 suggest-List，即使你scrollData 变化引起 scroll 刷新计算高度
    // scroll 是隐藏的，计算高度也是无效的 ---- 必须显示才能计算出高度 
    query(newVal) {
      if (!newVal) {
        setTimeout(() => {
          this.$refs.scrollRef.refresh()
        }, 20)
      }
    }
  },
  filters: {},
  methods: {
    ...mapActions(['saveHistory', 'delHistory', 'clearHistory']),
    // 保存搜索结果历史到 vuex 和 localstorage 中，保存的是query 而不是query 搜索出来相关答案
    savaHis() {
      this.saveHistory(this.query)
    },
//     deleteHis(item) {
//       this.delHistory(item)
//     },
    showConfirm() {
      this.$refs.confirmRef.show()
    },
    
    // 基础组件不做任何数据操作，只是派发事件，让父级来做
    confirm() {
      this.clearHistory()
    },
    cancel() {
      return
    },
    // serchBox 的 query 变化同步search 的query变化,然后suggest-list 的prop query变化，调用接口，。。。
    // 还是把各个组件的作用分开，谁拿数据，谁渲染，谁需要什么 都要分开
    onQueryChange(query) {
      
      this.query = query
    
    },
    addQuery(k) {
      this.$refs.searchBoxRef.getQuery(k)
    },
    // 获取热搜索数据
    _getHotKey() {
      getHotKey().then((res) => {
        if (res.code === 0) {
          // console.log(res.data.hotkey)
          this.hotkey = res.data.hotkey.slice(0, 10)
        }
      })
    },
    // 滚动前触发事件---- 解决移动端虚拟键盘被拉起的问题
    blurInput() {
      this.$refs.searchBoxRef.blur()
    },
    // 当有迷你播放器时，调整滚动底部距离
    handlePlaylist(playlist) {
      let bottom = playlist.length > 0 ? '60px' : ''

      this.$refs.shortcutRef.style.bottom = bottom
      this.$refs.scrollRef.refresh()

//       this.$refs.resultRef.style.bottom = bottom
//       this.$refs.suggestRef.refresh()
    }
  },
  computed: {
    ...mapGetters(['searchHistory']),
    // 因为scrollData 决定了scroll 的长度啊，scrollData 一变化，scroll 就要重新计算高度，来适应滑动
    scrollData() {
      return this.hotkey.concat(this.searchHistory)
    }
  },
  created () {
    this._getHotKey()
  },
  mounted () {},
  destroyed () {}
}
 
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.my-search 
  .search-box-wrapper 
    margin: 20px
    
  .shortcut-wrapper 
    position: fixed;
    top: 178px;
    bottom: 0;
    width: 100%;
    .shortcut 
      height: 100%;
      overflow: hidden;
      .hot-key 
        // height: 170px;
        // overflow: hidden;
        margin: 0 20px 20px 20px;
        .title 
          margin-bottom: 20px;
          font-size: $font-size-medium;
          color: $color-text-l;
        
        .item 
          display: inline-block;
          padding: 5px 10px;
          margin: 0 20px 10px 0;
          border-radius: 6px;
          background: $color-highlight-background;
          font-size: $font-size-medium;
          color: $color-text-d;
          &.special 
            color: rgba(255, 255, 255, 0.7);
            // border: 1px solid #fc4524;
         
      .search-history 
        position: relative;
        margin: 0 20px;
        .title 
          display: flex;
          align-items: center;
          height: 40px;
          font-size: $font-size-medium;
          color: $color-text-l;
          .text 
            flex: 1;
          
          .clear 
            @include extend-click();
            .icon-clear 
              font-size: $font-size-medium;
              color: $color-text-d;
         
  .search-result 
    position: fixed;
    width: 100%;
    top: 178px;
    bottom: 0;

</style>
