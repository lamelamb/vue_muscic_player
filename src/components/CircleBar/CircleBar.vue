<template>
  <div class="progress-circle">
	  <!--  width 和 height 是这个svg 的实际宽高 ，viewBox 视口宽度，从左上角 00 到 100 ，100，是一个相对的宽高 -->
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                        <!--  这里设置 圆心为 50，50 ,半径为50 是 相对是viewBox 来说的，可以看到正好充满视窗 -->
	  <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <!--
	       stroke-dasharray 描边  ， stroke-dashoffset 描边的偏移 ，progress-bar 是外层的圆形，外层叠加到内层之上
		   根据百分比不断计算dashOffset 就恩恩形成圆弧增长或者减少的效果
		-->
	  <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" 
	          :stroke-dasharray="dashArray" :stroke-dashoffset="dashOffset"/>
    </svg>
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      radius: {
        type: Number,
        default: 100
      },
      percent: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
		 // 这里的100 对应viewbox 里面设置的100 
        dashArray: Math.PI * 100
      }
    },
    computed: {
      dashOffset() {
        return (1 - this.percent) * this.dashArray
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-circle
    position: relative
    circle
      stroke-width: 8px
      transform-origin: center
      &.progress-background
        transform: scale(0.9)
        stroke: $color-theme-d
      &.progress-bar
        transform: scale(0.9) rotate(-90deg)
        stroke: $color-theme
</style>