<!-- 添加歌曲到队列 组件 -->

<template>
  <transition name="slide">
    <div class="my-add-song" v-show="showFlag" @click.stop>
      <!-- 头部 -->
      <div class="header">
        <h1 class="title">添加歌曲到队列</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="search-box-wrapper">
        <search-box ref="searchBoxRef" @query="onQueryChange" placeholder="搜索歌曲"></search-box>
      </div>

      <!-- 切换及其内容 -->
      <div class="shortcut" v-show="!query">
        <!-- tab 页切换效果 -->
        <my-switches :switches="switches" :currentIndex="currentIndex" @switch="switchItem"></my-switches>

        <div class="list-wrapper">
          <!-- 最近播放 -->
          <scroll ref="songListRef" v-if="currentIndex === 0" class="list-scroll" :data="playHistory">
            <div class="list-inner">
              <my-song-list :songs="playHistory" @select="selectSong"></my-song-list>
            </div>
          </scroll>

          <!-- 搜索历史 -->
          <scroll class="list-scroll" :refreshDelay="refreshDelay"
                     ref="searchListRef" v-if="currentIndex === 1" :data="searchHistory">
            <div class="list-inner">
              <search-list @delete="delHistory" @select="addQuery" :searches="searchHistory"></search-list>
            </div>
          </scroll>
        </div>
      </div>

      <div class="search-result" v-show="query">
        <suggest-list :query="query" :zhida="zhida" @select="savaHis" @beforeScroll="blurInput"></suggest-list>
      </div>

    <!--  添加歌曲，给与提示功能 -->
      <my-top-tip ref="topTipRef">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放列表</span>
        </div>
      </my-top-tip>
    </div>
  </transition>
</template>

<script>
import searchBox from '@/base/searchBox/searchBox'
import scroll from '@/base/scroll/scroll'
import MySwitches from '@/base/MySwitches/MySwitches'
import MySongList from '@/base/MySongList/MySongList'
import MyTopTip from '@/base/MyTopTip/MyTopTip'
import searchList from '@/base/searchList/searchList'
import suggestList from '@/components/suggestList/suggestList'
import { mapActions, mapGetters } from 'vuex'
import { createSingerSong } from '@/common/js/song.js'

export default {
  components: {
    searchBox,
    suggestList,
    searchList,
    scroll,
    MySwitches,
    MySongList,
    MyTopTip
  },
  data () {
    return {
      showFlag: false,
      // 搜索词
      query: '',
      // 不搜索歌手
      zhida: false,
      // 切换开关文案
      switches: [
        {name: '最近播放'},
        {name: '搜索历史'}
      ],
      // 当前切换开关
      currentIndex: 0,
      refreshDelay: 100
    }
  },
  props: {},
  watch: {},
  methods: {
    ...mapActions(['saveHistory', 'delHistory', 'insertSong']),
    // 保存搜索结果历史到 vuex 和 localstorage 中
    savaHis() {
      this.saveHistory(this.query)
      this.$refs.topTipRef.show()
    },
    deleteHis(item) {
      this.delHistory(item)
    },
    show() {
      this.showFlag = true
      // 一样的问题，必须显示出来scroll 才能正确计算高度
      setTimeout(() => {
        if (this.currentIndex === 0) {
          this.$refs.songListRef.refresh()
        } else {
          this.$refs.searchListRef.refresh()
        }
      }, 20)
    },
    hide() {
      this.showFlag = false
    },
    // 当检索值改变时
    onQueryChange(query) {
      this.query = query
    },
    addQuery(k) {
      this.$refs.searchBoxRef.getQuery(k)
    },
    // 滚动前触发事件
    blurInput() {
      this.$refs.searchBoxRef.blur()
    },
    switchItem(index) {
      this.currentIndex = index
    },
    selectSong(item, index) {
      if (index !== 0) {
        this.insertSong(new createSingerSong(item))
      }

      this.$refs.topTipRef.show()
    }
  },
  // 过滤器设计目的就是用于简单的文本转换
  filters: {},
  // 若要实现更复杂的数据变换，你应该使用计算属性
  computed: {
    ...mapGetters(['searchHistory', 'playHistory'])
  },
  created () {},
  mounted () {},
  destroyed () {}
}
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.my-add-song 
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 200;
  background: $color-background;
  &.slide-enter-active, &.slide-leave-active 
    transition: all 0.3s;
  
  &.slide-enter, &.slide-leave-to 
    transform: translate3d(100%, 0, 0);
  
  .header 
    position: relative;
    height: 44px;
    text-align: center;
    .title 
      line-height: 44px;
      font-size: $font-size-large;
      color: $color-text;
    
    .close 
      position: absolute;
      top: 0;
      right: 8px;
      .icon-close 
        display: block;
        padding: 12px;
        font-size: 20px;
        color: $color-theme;
    
  .search-box-wrapper 
    margin: 20px;
  
  .shortcut 
    .list-wrapper 
      position: absolute;
      top: 165px;
      bottom: 0;
      width: 100%;
      .list-scroll 
        height: 100%;
        overflow: hidden;
        .list-inner 
          padding: 20px 30px;
      
  .search-result 
    position: fixed;
    top: 124px;
    bottom: 0;
    width: 100%;
  
  .tip-title 
    text-align: center;
    padding: 18px 0;
    font-size: 0;
    .icon-ok 
      font-size: $font-size-medium;
      color: $color-theme;
      margin-right: 4px;
    
    .text 
      font-size: $font-size-medium;
      color: $color-text;
    
</style>
