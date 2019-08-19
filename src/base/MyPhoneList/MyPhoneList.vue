<!-- 类电话簿组件 -->
<template>
  <scroll ref="scrollRef"
             :data="data"
             :probeType="probeType"
             :listen-scroll="listenScroll"
             @scroll="scroll"
             class="my-phone-list">
    <!-- 左侧歌手列表，只对第一个子元素有效 -->
    <ul>
      <li ref="leftRef" v-for="group in data" class="list-group">
        <h2 class="list-group-title">{{ group.title }}</h2>
        <ul>
          <li v-for="item in group.items" @click="selectItem(item)" class="list-group-item">
            <img v-lazy="item.avatar" class="avatar">
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    
    <!-- 右侧字母列表 -->
    <div @touchstart="onShortcutTouchstart"
         @touchmove.stop.prevent="onShortcutTouchmove"
         class="list-shortcut">
      <ul>
        <li
          v-for="(item, index) in shortcut"
          :data-index="index"
          :class="{ 'current': currentIndex === index }"
          class="item">{{ item }}
         </li>
      </ul>
    </div>

    <!-- 滚动固定标题实现 -->
    <div ref="fixedTitleRef" v-show="fixedTitle" class="list-fixed">
      <h1 class="fixed-title">{{ fixedTitle }}</h1>
    </div>

    <!-- loading 组件 -->
    <div v-show="!data.length" class="loading-container">
      <my-loading></my-loading>
    </div>
  </scroll>
</template>

<script>
import scroll from '@/base/scroll/scroll'
import MyLoading from '@/base/MyLoading/MyLoading'
import { myDOM } from '@/common/js/myutils.js'

// 18 = 3*2 + $font-size-small ,是从css 中算出来的 ，是右边每个字母的高度
const RIGHT_ONEWORD_HEIGHT = 18
// 固定title 的高度
const TITLE_HEIGHT = 29

export default {
  components: {
    scroll,
    MyLoading
  },
  data () {
    return {
      scrollY: -1,    // 通过它可以判断究竟现在在哪个位置
      currentIndex: 0,
      // 标题上推    y值（热门标题 - A 标题）
      diff: -1
    }
  },
  props: {
    data: {
      type: Array,
      default: []
    }
  },
  watch: {
  	// 命名不好，这里监听的是props 里面的data
  	// 父组件出拿来得出数据变了，延时计算高度
    data() {
      setTimeout(() => {
        this._caclHeight()
      }, 20)
    },
    // 监听 scrollY 落在 leftListHeight 的哪个区间，实现高亮联动
    scrollY(newY) {
      const leftListHeight = this.leftListHeight

      // 当滚动到顶部，newY > 0 ，滚动 newY 是个负值
      if (newY > 0) {
        this.currentIndex = 0
        return
      }

      // 在中间部分滚动，怎么判断，scrollY 落在 哪个区间 ，区域的上下
      // leftListHeight.length - 1 ，不超过最后一个元素的上限
      for (let i = 0 ;i < leftListHeight.length - 1 ;i++) {
        let height1 = leftListHeight[i]
        let height2 = leftListHeight[i + 1]
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          // 滚动视差，不断更新这个视差
          this.diff = height2 + newY       
          return
        }
      }

      // 当滚动到底部，且-newY大于最后一个元素的上限
      this.currentIndex = leftListHeight.length - 2
    },
    // 监控这个 diff ,就是那当前固定 的title
    diff(newVal) {
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0

      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixedTitleRef.style.transform = `translate3d(0, ${fixedTop}px, 0)`
    }
  },
  methods: {
    // 对父亲提供的刷新 better-scroll 方法
    refresh() {
      this.$refs.scrollRef.refresh()
    },
    // 向上派发 item 项点击事件
    selectItem(item) {
      this.$emit('select', item)
    },
    // 点击右侧，左侧联动
    // 电脑端的点击 ----》 在移动端可以使用Touchstart 代替
    onShortcutTouchstart(e) {
      // console.log(e.target)
      // console.log(e.touches)

      let nowTouch = e.touches[0]
      this.touch.y1 = nowTouch.pageY
           // 获取自定义的data-index 的属性值，也就是  
      let nowIndex = myDOM.customAttribute(e.target, 'index')
        // 存在中间容器 this.touch ，方便 Touchmove 使用
      this.touch.nowIndex = nowIndex
     // 调用scroll 对象方法滚动到指定位置
      this._scrollTo(nowIndex)
    },
    // 滑动右侧，左侧联动，与左侧共享 touch 
    onShortcutTouchmove(e) {
      let nowTouch = e.touches[0]
      this.touch.y2 = nowTouch.pageY

      // 两次 touch y轴偏移，计算出应该停在新index 位置上
      let offset = Math.floor((this.touch.y2 - this.touch.y1) / RIGHT_ONEWORD_HEIGHT)
      let nowIndex = Number(this.touch.nowIndex) + offset

      this._scrollTo(nowIndex)
    },
    // 监听到scroll 组件的scroll 事件
    scroll(pos) {
      this.scrollY = pos.y
    },
    _scrollTo(index) {
      // console.log(index)
      // 超出范围不能点击和拖动
      // 我们touchstat 是加载ul 上的，ul 的2端不能点击，可以通过只有li 才有自定义属性data-index 来确定
      if (!index) {
        return
      }
      //  处理滑动情况，不可以为负值（顶部）也不可以超过最大（底部）
      if (index < 0) {
        index = 0
      } else if (index > this.leftListHeight.length - 2) {
        index = this.leftListHeight.length - 2
      }
        // 跟新当前index 的值
      this.currentIndex = Number(index)
      
      this.$refs.scrollRef.scrollToElement(this.$refs.leftRef[index], 0)
    },
		refresh(){
			this.$refs.scrollRef.refresh()
		},
    // 计算 leftListHeight 的高度
    _caclHeight() {
      // 第一个元素的上方距离高度为 0 
      let height = 0
      this.leftListHeight = []
      this.leftListHeight.push(height)

      let list = this.$refs.leftRef
      for (let i = 0 ; i < list.length ;i++) {
        height += list[i].clientHeight
        this.leftListHeight.push(height)
      }
      // 得到左边列表每一个区域的高度
      // console.log(this.leftListHeight) // (24) [0, 760, 1030, 1370, 1780, 1910, 2110, 2450, 2720, 3060, 3190, 3950, 4430, 4700, 4900, 5100, 5370, 5570, 5980, 6460, 7010, 7560, 7900, 9010]
    }
  },
  computed: {
    // 快速入口排列数组
    shortcut() {
      return this.data.map((group) => {
      	// 热门 ---》 热 ，A ----->A
        return group.title.substr(0, 1)
      })
    },
    //根据 this.currentIndex 来显示
    fixedTitle() {
    	// 解决 在顶部时出现2 个title 的问题
      if (this.scrollY > 0) {
        return ''
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  created () {
  	// 为什么不直接写在data 里面， 因为我不想让这些属性被自动监听， 减少系哦啊好，只是起到一个中间容器的作用
    this.touch = {}
    this.listenScroll = true      // 改写默认listenScroll  false 
    this.leftListHeight = []      // 记录左边dom 的高度
    this.probeType = 3       // better-scroll 滚动组件 不节流，覆盖默认节流设置
  },
  mounted () {},
  destroyed () {}
}
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'
/* 给这个组件 设置position ,是为了给滚动条一个最近的基点，滚动条是绝对定位的*/
.my-phone-list 
  position: relative
  width: 100%
  height: 100%
  overflow: hidden
  background: $color-background
  .list-group 
    padding-bottom: 30px
    .list-group-title 
      height: 30px
      line-height: 30px
      padding-left: 20px
      font-size: $font-size-small
      color: $color-text-l
      background: $color-highlight-background
   
    .list-group-item 
      display: flex
      align-items: center
      padding: 20px 0 0 30px
      .avatar 
        width: 50px
        height: 50px
        border-radius: 50%
      
      .name 
        margin-left: 20px
        color: $color-text-l
        font-size: $font-size-medium
     
  .list-shortcut 
    position: absolute
    z-index: 30
    right: 0
    top: 50%
    transform: translateY(-50%)
    width: 20px
    padding: 20px 0
    border-radius: 10px
    text-align: center
    background: $color-background-d
    font-family: Helvetica
    .item 
      padding: 3px
      line-height: 1
      color: $color-text-l
      font-size: $font-size-small
      &.current 
        color: $color-theme
     
  .list-fixed 
    position: absolute
    top: -1px
    left: 0
    width: 100%
    .fixed-title 
      height: 30px
      line-height: 30px
      padding-left: 20px
      font-size: $font-size-small
      color: $color-text-l
      background: $color-highlight-background
    
  .loading-container 
    position: absolute
    width: 100%
    top: 50%
    transform: translateY(-50%)
  
</style>
