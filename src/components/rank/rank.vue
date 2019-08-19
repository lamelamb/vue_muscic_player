<!-- 排行页组件，页面级别 -->
<template>
  <div class="my-rank" ref="rankRef">
     <!-- 排行榜数据 -->
    <scroll class="toplist" ref="scrollRef" :data="toplist">
           <ul>
             <li class="item" v-for="item in toplist" @click="selectItem(item)">
               <!-- 左 -->
               <div class="icon">
                 <img width="100" height="100" v-lazy="item.picUrl" @load="loadImg">
               </div>
           
               <!-- 右 -->
               <ul class="songlist">
                 <!-- <h3 class="title">{{ item.topTitle }}</h3> -->
                 <li class="song" v-for="(song, index) in item.songList">
                   <span>{{ index + 1 }}</span>
                   <span>{{ song.songname }}</span>
                   <span class="singername"> - {{ song.singername }}</span>
                 </li>
               </ul>
             </li>
           </ul>
            <!-- loading 组件 -->
           <div v-show="!toplist.length" class="loading-container">
             <my-loading></my-loading>
           </div>
        </scroll>
       <!-- 子路由 ， rankDetail 组件 -->
     <router-view></router-view>
  </div>
</template>

<script>
  import {  mapMutations  } from 'vuex'
import { playlistMixin } from '@/common/js/mixin.js'
import { getRankList } from '@/api/rank.js'
import scroll from '@/base/scroll/scroll'
import MyLoading from '@/base/MyLoading/MyLoading'
export default {
      mixins: [playlistMixin],
      data(){
      	  return {
      	  	  toplist:[],
      	  }
      },
      components: {
        MyLoading,
        scroll
      },
      created(){
            this._getRankList() 
      },
       methods:{
         
         ...mapMutations({
         						setToplist: 'SET_TOPLIST',
         }),
         // 当有迷你播放器时，调整滚动底部距离--- 必须在页面级别组件实现
         handlePlaylist(playlist) {
            let bottom = playlist.length > 0 ? '60px' : ''
             this.$refs.rankRef.style.bottom = bottom
             this.$refs.scrollRef.refresh()
         },
         // 获取数据
          _getRankList () {
              getRankList().then((res) => {
              
                 if (res.code === 0) {
                     this.toplist = res.data.topList
                 }
               })
         },
         
         // 点击进入子路由 rankDetail
         selectItem (item) {
             this.$router.push({
                 path: `/rank/${item.id}`
              })
              
              // 把当前的排行榜对象传给 vuex.state.topList
              this.setToplist(item)
         },
         
         // 当首次获取到图片时--首个加载完成的图片触发load 事件，Better-scroll 重新计算便于滑动
         // 所以 this.flag 只是用一次，不需要在data 中定义
         loadImg () {
           if (!this.flag) {
              this.$refs.scrollRef.refresh()
              this.flag = true
           }
         },
         
         
       }
  
}

</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.my-rank 
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  .toplist 
     height: 100%;
     overflow: hidden;
    .item 
      display: flex;
      margin: 0 20px;
      padding-top: 20px;
      height: 100px;
      &:last-child 
        padding-bottom: 20px;
      
      .icon 
        flex: 0 0 100px;
        width: 100px;
        height: 100px;
      
      .songlist 
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 20px;
        height: 100px;
        overflow: hidden;
        background: $color-highlight-background;
        color: $color-text-l;
        font-size: $font-size-small;
        .song 
          no-wrap();
          line-height: 26px;
          .singername 
            color: rgba(255, 255, 255, 0.2);
        
    .loading-container 
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);


</style>
