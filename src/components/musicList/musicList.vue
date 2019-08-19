<!-- 歌单列表组件 -->

<template>
  <div class="my-music-list">
    <!-- 返回按钮 -->
    <div @click="back" class="back" >
      <i class="icon-back" >返回</i>
    </div>

    <!-- 顶部歌手名字 -->
    <h1 v-html="title" class="title"></h1>

    <div ref="bgImageRef" :style="bgStyle" class="bg-image">
      <!-- 随机播放全部,  有song 的时候才出现 -->
      <div ref="playRef" v-show="songs.length > 0" @click="playRandom" class="play-wrapper">
        <div class="play">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>

      <!-- 蒙层 -->
      <div ref="filterRef" class="filter"></div>
    </div>

    <!-- 推层。仿原生滚动效果 
    	  list 容器本身是不变的，但是它的内容会 滚动
    	  bg-layer 在 list 上面，保证被 list 覆盖，背景色取一样的，形成视觉欺骗效果
    	  当往上滚动的时候， bg-layer 随之滚动等于给 content 加上一个背景色 而已，并且赋值 z-index 保证盖住  bgImageRef
    -->
    <div ref="bgLayerRef" class="bg-layer"></div>

    <scroll class="list"
               @scroll="scroll"
               ref="scrollRef"
               :data="songs"
               :probe-type="probeType"
               :listen-scroll="listenScroll">
          <div class="song-list-wrapper">
            <my-song-list @select="selectItem" :songs="songs" :rank="rank"></my-song-list>
          </div>
      
          <!-- loading 组件，绝对居中定位的 -->
          <div v-show="!songs.length" class="loading-container">
            <my-loading></my-loading>
          </div>
    </scroll>
  </div>
</template>

<script>
import MySongList from '@/base/MySongList/MySongList'
import scroll from '@/base/scroll/scroll'
import MyLoading from '@/base/MyLoading/MyLoading'
import { mapActions } from 'vuex'
import { playlistMixin } from '@/common/js/mixin.js'

const TRANSFORMY_RESERVED = 40

export default {
  mixins: [playlistMixin],
  components: {
    MySongList,
    scroll,
    MyLoading
  },
  data () {
    return {
      // 推层上移的距离，因为要监听 scrollY ，所以 scrollY 要设置成这种 响应式的属性 
      scrollY: 0
    }
  },
  props: {
    // 背景图
    bgImage: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      default: []
    },
    title: {
      type: String,
      default: ''
    },
    // 子组件排行奖杯图片--- 控制
    rank: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    // 监听scrollY ，对推层的滚动，以及限制
    scrollY(newVal) {
			// 推层往上 最多滚动距离minscrollY ，因为是负数 
      let minscrollY = -this.bgImageHeight + TRANSFORMY_RESERVED
			//  推层的滚动距离 
      let moveY = Math.max(minscrollY, newVal)
      let zIndex = 0

      //  bgLayerRef 推层  兼容性， 下载 style 标签里面没事，因为 vue_loader 自动帮我们处理了，现在我盟写在js 里面，就要自己封装了
      this.$refs.bgLayerRef.style['transform'] = `translate3d(0 ,${moveY}px, 0)`
      this.$refs.bgLayerRef.style['webkitTransform'] = `translate3d(0 ,${moveY}px, 0)`

      // 下拉放大、上拉模糊
      let scale = 1
      let blur = 0
      const formula = Math.abs(newVal / this.bgImageHeight)
 
      // 往下拉，图片放大，同时设置index 不被后面遮住
      if (newVal > 0) {
        zIndex = 10
        scale = 1 + formula
        this.$refs.bgImageRef.style['transform'] = `scale(${scale})`
        this.$refs.bgImageRef.style['webkitTransform'] = `scale(${scale})`
      } else { 
      	 // 上拉模糊，这个在电脑上看不出来
        blur = Math.min(20 * formula, 20)
        this.$refs.filterRef.style['backdrop-filter'] = `blur(${blur}px)`
        this.$refs.filterRef.style['webkitBackdrop-filter'] = `blur(${blur}px)`
      }

      // 不推到顶，留一部分
      // 往上推负数 ，推到我们预留的40px 高度的时候
      if (newVal < minscrollY) {
        zIndex = 10
				//    我们是通过padding 来达到宽高比的 ，所以别忘了
        this.$refs.bgImageRef.style.paddingTop = 0
        this.$refs.bgImageRef.style.height = `${TRANSFORMY_RESERVED}px`
        // 滚动到顶部，隐藏 随机播放全部 按钮
        this.$refs.playRef.style.display = 'none'
      } else {
      	// 重置会原来的样式
        this.$refs.bgImageRef.style.paddingTop = '70%'
        this.$refs.bgImageRef.style.height = 0
        // 显示 随机播放全部 按钮
        this.$refs.playRef.style.display = 'block'
      }
      this.$refs.bgImageRef.style.zIndex = zIndex
    }
  },
  methods: {
    ...mapActions(['selectPlay', 'randomPlay']),
    // 当有迷你播放器时，调整滚动底部距离
   handlePlaylist(playlist) {
			 let bottom = playlist.length > 0 ? '60px' : ''
			 this.$refs.scrollRef.$el.style.bottom = bottom
			 this.$refs.scrollRef.refresh()
   },
    // 返回按钮
    back() {
    	 // ==  this.$router.go(-1)
      this.$router.back()
    },
    // 父子组件传值
    scroll(pos) {
      // console.log(pos.y)
      // 实时给这个scrollY 赋值，根据这个 scrollY 的不同位置，做出交互效果
      this.scrollY = pos.y
    },
    // 对儿子说：给你这些在 vuex 中管理的数据
    selectItem(item, index) {
			  // 调用action ，更改vuex 的数据
				
      this.selectPlay({
        list: this.songs,
        index
      })
			
			
    },
    // 随机播放全部按钮
    playRandom() {
			// 调用action  ,对全局 也就是vuex 的一些属性进行更改
      this.randomPlay({
        list: this.songs
      })
    }
  },
  computed: {
    bgStyle() {
      return `background-image:url(${this.bgImage})`
    }
  },
  created () {
  	// 打开 实时滚动
    this.probeType = 3
    this.listenScroll = true
  },
  mounted () {
  	// 拿到背景图片高度，挂载到属性缓存一下，不需要重复取了 
     this.bgImageHeight = this.$refs.bgImageRef.clientHeight
    // console.log(this.bgImageHeight) // 290
    // 滚动区域的初始 top，$el 为 DOM 元素，设置初始滚动高度
    // 让滚动条的 top 就是背景图的高度，也就是定义丛书名地方开始可以滚动
     this.$refs.scrollRef.$el.style.top = `${this.$refs.bgImageRef.clientHeight}px`
  },
  destroyed () {}
}
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.my-music-list 
  position: fixed
  z-index: 100
  top: 0
  left: 0
  bottom: 0
  right: 0
  background: $color-background
  .back 
    position: absolute
    top: 0
    left: 6px
    z-index: 100
    .icon-back 
      display: block
      padding: 10px
      font-size: $font-size-large-x
      color: $color-theme
    
  .title 
    position: absolute
    top: 0
    left: 10%
    z-index: 40
    width: 80%
    @include no-wrap()
    text-align: center
    line-height: 40px
    font-size: $font-size-large
    color: $color-text
  
  /* 为什么使用padding-top: 70% ，因为padding 是相对于父元素的宽度的，这样就可以控制宽高10:7 */
  .bg-image 
    position: relative
    width: 100%
    height: 0
    padding-top: 70%
    transform-origin: top
    background-size: cover
    .play-wrapper 
      position: absolute
      bottom: 20px
      z-index: 50
      width: 100%
      .play 
        box-sizing: border-box
        width: 135px
        padding: 7px 0
        margin: 0 auto
        text-align: center
        border: 1px solid $color-theme
        color: $color-theme
        border-radius: 100px
        font-size: 0
        .icon-play 
          display: inline-block
          vertical-align: middle
          margin-right: 6px
          font-size: $font-size-medium-x
        
        .text 
          display: inline-block
          vertical-align: middle
          font-size: $font-size-small
        
    .filter 
      position: absolute
      top: 0
      left: 0
      width: 100%
      height: 100%
      background: rgba(7, 17, 27, 0.4)
   
  .bg-layer 
    position: relative
    height: 100%
    background: $color-background
  
  .list 
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    background: $color-background
    .song-list-wrapper 
      padding: 20px 30px
    
    .loading-container 
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
    
</style>
