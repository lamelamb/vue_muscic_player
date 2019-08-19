<!-- 歌单页组件 -->
<template>
	<!-- 类似的歌单过渡动画 -->
	<transition name="slide">
	  <div class="my-singer-detail" ref="singerRef">
	        <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
	  </div>
  </transition>
</template>

<script>
// 来去数据	
import {  mapGetters  } from 'vuex'	
import { getSongList } from 'api/recommend'
import { ERR_OK }  from 'api/config'
import { createSongList } from '@/common/js/song.js'
import {  getSongVkey} from '@/api/singer.js'
// 歌曲列表
import  musicList  from '@/components/musicList/musicList' 
export default {
	data(){
		return {
			// songs 得异步获取
			songs:[]
		}
	},
    created(){
    	this.getSongList()
    },
	methods:{
		getSongList(){
            // 解决在歌单详情页刷新问题
            if( !this.disc.dissid ){
            	this.$router.push({
                    path: '/recommend'
                  })
            	return ;
            }
			 getSongList( this.disc.dissid ).then((res)=>{
				   if(res.code === ERR_OK){
                         console.log(res.cdlist[0].songlist )
					     this.songs =   this._formatSongs( res.cdlist[0].songlist ) ;
				       }
			 })
		},
        
       // 重组 res.data.list 数据
      		    _formatSongs (list) {
      		      let result = []
      		
      		      list.forEach((musicData) => {
                  // 发n 个请求 ，为了得到 vkey 关键点
      				getSongVkey(musicData.mid).then((res) => {
      					  const vkey = res.data.items[0].vkey
      					  if (musicData.id && musicData.album.id) {
      						result.push( createSongList(musicData, vkey) )
      					  }
      					})
      				
      		      })
      		
      		      return result
      		    
      		  },
	},
	 components: {
	    musicList 
	},
    computed:{
    	 ...mapGetters(['disc']),
		 // 传入子组件
		    title() {
		      return this.disc.dissname
		    },
		    bgImage() {
		      return this.disc.imgurl
		    }
    }
}
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'
/*translate3d(100%, 0, 0) 右边，translate3d(-100%, 0, 0) 左边推出来 */
.slide-enter-active ,.slide-leave-active
       transition: all .3s ease;
.slide-enter, .slide-leave-to 
     opacity: 0
     transform: translate3d(100%, 0, 0)
 
.my-singer-detail 
     position: fixed;
     z-index: 100;
     top: 0;
     left: 0;
     right: 0;
     bottom: 0;
     background: $color-background;
</style>
