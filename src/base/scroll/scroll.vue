<template>
   <div ref="wrapper" class="my-scroll">
    <slot></slot>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
import { myDOM } from '../../common/js/myutils.js'
export default {
  components: {},
  data () {
    return {}
  },
  props: {
    // 传入的数据
    data: {
      type: Array,
      default: null
    },
    // 是否节流？ 实时滚动得是3 
    probeType: {
      type: Number,
      default: 1
    },
    // 点击穿透
    click: {
      type: Boolean,
      default: true
    },
    // 是否监听滚动位置 -- 用于电话列表 左右联动
    listenScroll: {
      type: Boolean,
      default: false
    },
    // 是否开启上拉刷新
    pullup: {
      type: Boolean,
      default: false
    },
    // 滚动前是否触发事件，如：滚动前让输入框失去焦点，避免滚动搜索结果时移动端键盘遮挡
    beforeScroll: {
      type: Boolean,
      default: false
    },
    // 延迟刷新
    refreshDelay: {
      type: Number,
      default: 20
    }
  },
  watch: {
  	// 对动态数据进行监听，一旦变化， 等待dom 渲染结束后，调用better scroll重新渲染 
  	// 这里完全可以用vue 提供的this.$nextTick() 方法,而不是经验时间延迟 ，浏览器大概17 ms渲染一次，所以20 是 一个经验值
    data () {
      setTimeout(() => {
       
          this.refresh()
      }, this.refreshDelay)
    }
  },
  methods: {
    _initScroll() {
    	// 没有容器直接退出
      if (!this.$refs.wrapper) {
        return
      }
        // this.refs.wrapper  是一个dom 对象
       // 将scroll 实例挂载scroll 组件属性上去                 
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click
      })

      // 派发监听滚动位置事件，是就派发事件
      if (this.listenScroll) {
        let me = this
        this.scroll.on('scroll', (pos) => {
          // 向父组件传值,派发 srcoll 事件
          me.$emit('scroll', pos)
        })
      }

      // 派发上拉刷新时间
      if (this.pullup) {
        this.scroll.on('scrollEnd', () => {
          if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
            // 滑动到底部了
            this.$emit('scrollToEnd')
          }
        })
      }

      // 滚动前是否触发事件
      if (this.beforeScroll) {
        this.scroll.on('beforeScrollStart', () => {
          this.$emit('beforeScroll')
        })
      }
    },
		// 提供给父级调用的方法
    enable() {
      this.scroll && this.scroll.enable()
    },
    disable() {
      this.scroll && this.scroll.disable()
    },
    refresh() {
      this.scroll && this.scroll.refresh()
    },
    scrollTo() {
    	// 这里的arguments 指的是调用scrollTo 传入的参数 绑定调用的对象是  滚动的对象
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
    },
    scrollToElement() {
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
    }
  },
  created () {},
  //  初始化better-scroll 父元素和子元素的内容已经正确渲染了。如果子元素或者父元素 DOM 结构发生改变的时候，必须重新调用 scroll.refresh() 方法重新计算来确保滚动效果的正常

  mounted () {
    setTimeout(() => {
      this._initScroll()
    }, 20)
  }
}
</script>

<style lang="stylus" scoped>


</style>