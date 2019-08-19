<!-- 推荐页组件 -->
<template>
  <div class="my-recommend" ref="recommendRef">
  	  <!-- better-scroll 滚动组件，当请求到 lists 时才渲染 -->
    <scroll ref="scroll" :data="lists" class="recommend-content">
    	<!-- scroll 只对第一个直接子元素起作用  -->
      <div>
	        <!-- 确保recommends 有数据，然后更具 slider 组件的mounted 之后再获取slider组件的狂傲给better-scroll 重新渲染 -->
	        <div v-if="recommends.length" class="slide-wrapper">
	          <slider>
	            <div v-for="recommend in recommends">
	              <a :href="recommend.linkUrl">
	              	   <!-- fastClick 提供配置对有needsclick 的dom不拦截请求 -->
	                <img @load="loadImg" :src="recommend.picUrl" class="needsclick">
	              </a>
	            </div>
	          </slider>
	        </div>
        
        <!-- 歌单推荐列表 -->
	        <div class="recommend-list">
	          <h1 class="list-title">热门歌单推荐</h1>
	          <ul>
	            <li @click="selectItem(item)" v-for="item in lists" class="item">
	              <div class="icon">
	                <img v-lazy="item.imgurl" width="60" height="60">
	              </div>
	              <div class="text">
	                <p v-html="item.creator.name" class="name"></p>
	                <p v-html="item.dissname" class="desc"></p>
	              </div>
	            </li>
	          </ul>
	        </div>
      <!-- loading 组件 -->
      <div v-show="!lists.length" class="loading-container">
        <my-loading></my-loading>
      </div>
     </div>
    </scroll>
       <!-- 子路由  -->
　　　<router-view ></router-view>
　　　       
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { getRecommend ,getList } from  'api/recommend'
import slider from '@/base/slider/slider'
import scroll from '@/base/scroll/scroll'
import MyLoading from '@/base/MyLoading/MyLoading'
import { playlistMixin } from '@/common/js/mixin.js'

export default {
	  mixins: [playlistMixin],
	  created(){
	  	 this._getRecommend()
	  	 this._getList ()
	  },
	  components: {
	    slider,
	    scroll,
	    MyLoading,
    },
	  data(){
	  	  return {
	  	  	   recommends: [],
             lists:[],
	  	  }
	  },
	   methods:{
			 ...mapMutations({
						setDisc: 'SET_DISC',
			 }),
			 // 当有迷你播放器时，调整滚动底部距离
			 handlePlaylist(playlist) {
			   let bottom = playlist.length > 0 ? '60px' : ''
			   this.$refs.recommendRef.style.bottom = bottom
			   this.$refs.scroll.refresh()
			 },
			 
	   	   // 对比  _getList () ，发现async 和await 更加方便热
	   	  // 获取轮播图数据
     async _getRecommend () {
//	      getRecommend().then( (res) => {
//	        if (res.code === 0) {
//	              this.recommends = res.data.slider;
//	          }
//	      })
          let res = await getRecommend()
	        if (res.code === 0) {
	              this.recommends = res.data.slider;
	          }
	      
    },
    // 获取歌单列表数据
    _getList () {
      getList().then((res) => {
        if (res.code === 0) {
          this.lists = res.data.list;
					
        }
      })
    },
			// 当首次获取到图片时，Better-scroll 重新计算
			// 所以图片大小最好一致 ，因为只是计算一个图片
    loadImg () {
    	// 常见标志 ，适合哪种只一次就获取信息的情况 
      if (!this.flag) {
      	// this.$refs.scroll ,scroll 是一个组件，所以这里是一个组件实例 ，自然可以使用实例方法 
        this.$refs.scroll.refresh()
        this.flag = true
      }
    }	,
    // 点击歌单，子路由跳转
    selectItem(item){
    	this.$router.push({
        path: `/recommend/${item.dissid}`
      })
      // 写入 vuex
      this.setDisc(item)
    },
	   	 
	   	
	   }
	
}
 

</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.my-recommend 
  position: fixed
  width: 100%
  top: 88px
  bottom: 0
  .recommend-content 
    height: 100%
    overflow: hidden
    .slide-wrapper 
      position: relative
      width: 100%
      overflow: hidden
    
    .recommend-list 
      .list-title 
        height: 65px
        line-height: 65px
        text-align: center
        font-size: $font-size-medium
        color: $color-theme
      
      .item 
        display: flex
        align-items: center
        box-sizing: border-box
        padding: 0 20px 20px 20px
        .icon 
          flex: 0 0 60px
          width: 60px
          padding-right: 20px
        
        .text 
          display: flex
          flex-direction: column
          justify-content: center
          flex: 1
          line-height: 20px
          overflow: hidden
          font-size: $font-size-medium
          .name 
            margin-bottom: 10px
            color: $color-text
          
          .desc 
            color: $color-text-d
          
        
      
    
    .loading-container 
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
    
  
  


</style>
