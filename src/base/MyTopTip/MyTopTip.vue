<!-- 顶部提示 组件 -->

<template>
  <!--  从顶部出来，移出顶部 -->
  <transition name="drop">
    <div class="my-top-tip" v-show="showFlag" @click.stop="hide">
      <slot></slot>
    </div>
  </transition>
</template>

<script>
export default {
  components: {},
  data () {
    return {
      showFlag: false
    }
  },
  props: {
    // 延迟关闭时间-
    delay: {
      type: Number,
      default: 2000
    }
  },
  watch: {},
  methods: {
    show() {
      this.showFlag = true

      clearTimeout(this.timer)

      // delay 秒自动关闭--- 这种顶部提示几秒关闭的效果
      this.timer = setTimeout(() => {
        this.showFlag = false
      }, this.delay)
    },
    hide() {
      this.showFlag = false
    }
  },
  // 过滤器设计目的就是用于简单的文本转换
  filters: {},
  // 若要实现更复杂的数据变换，你应该使用计算属性
  computed: {},
  created () {},
  mounted () {},
  destroyed () {}
}
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.my-top-tip 
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 500;
  background: $color-dialog-background;
  &.drop-enter-active, &.drop-leave-active 
    transition: all 0.3s;

  &.drop-enter, &.drop-leave-to 
    transform: translate3d(0, -100%, 0);

</style>
