<template>
  <div class="my-header">
    <div class="icon"></div>
    <h1 class="text">Chicken Music</h1>
    <!-- 个人中心 -->
    <router-link to="/user" class="mine" tag="div">
      <i class="icon-mine"></i>
    </router-link>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  }
}
</script>
<!-- 配置别名的时候，前面需要加上~  -->
<style lang="stylus" scoped>
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.my-header 
  position: relative
  height: 44px
  text-align: center
  color: $myclor
  font-size: 0
  .icon 
    display: inline-block
    vertical-align: top
    margin-top: 6px
    width: 30px
    height: 32px
    margin-right: 9px
    bg-image('logo')
    background-size:30px 32px
 
  .text 
    display: inline-block
    vertical-align: top
    color: white
    line-height: 44px
    font-size: $font-size-large
 
  .mine 
    position: absolute
    top: 0
    right: 0
    .icon-mine
      display: block
      padding: 12px
      font-size: 20px
      color: $color-theme
   
</style>
