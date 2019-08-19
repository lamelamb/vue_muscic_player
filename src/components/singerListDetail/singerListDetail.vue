<!-- 歌手页组件 -->
<template>
	  <transition name="slide">
	     <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
    </transition>
</template>

<script>
// 来去数据	
import {  mapGetters  } from 'vuex'	
import { getSingerDetail } from  'api/singer'
import { createSingerSong } from '@/common/js/song.js'
import {  getSongVkey} from '@/api/singer.js'
// 歌曲列表
import  musicList  from '@/components/musicList/musicList'
export default {
	data(){
		return {
			songs:[]
		}
	},
    created(){
    	this._getSingerList()
    },
    components: {
	    musicList,
	    
    },
    methods:{
    	_getSingerList(){
    		// 用户刷新，回退到singer 页面
    		if( !this.singer.id ){
    			this.$router.push({
		        path: '/singer'
		      })
    			return ;
    		}
    		getSingerDetail( this.singer.id ).then( (res) => {
	           if (res.code === 0) {
				// 给 song 赋值 
	             this.songs = this._formatSongs ( res.data.list )
	              console.log( this.songs )
	             }
	         })
	      
    	},
    	 // 重组 res.data.list 数据
		    _formatSongs (list) {
		      let result = []
		
		      list.forEach((item) => {
		        // 解构赋值
		        let {musicData} = item ;
		      
// 		        if (musicData.songid && musicData.albummid) {
// 		          result.push(createSingerSong(musicData))
// 		        }
         // 发n 个请求 ，为了得到 vkey 
				getSongVkey(musicData.songmid).then((res) => {
					  // console.log('这首歌的vkey获取到了')
					  const vkey = res.data.items[0].vkey
					  if (musicData.songid && musicData.albummid) {
						result.push(createSingerSong(musicData, vkey))
					  }
					})
				
		      })
		
		      return result
		    
		  },
    },
    //  mapGetters 提供将vuex 的state 映射为计算属性的 语法糖
    // 使用对象展开运算符将 getter 混入 computed 对象中
    // 数组形式比较简洁，但是要保证gettrs 的变量名 和要映射的计算属性变量名一致
    // 如果你想将一个 getter 属性另取一个名字，使用对象形式
		
    computed:{
    	 ...mapGetters(['singer']),
    	 // music-list
		    title() {
		      return this.singer.name
		    },
		    bgImage() {
		      return this.singer.avatar
		    }
    }
}
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'
/*translate3d(100%, 0, 0) 右边 ，translate3d(-100%, 0, 0) 左边推出来 */
.slide-enter-active ,.slide-leave-active
       transition: all .3s ease
.slide-enter, .slide-leave-to 
     opacity: 0
     transform: translate3d(100%, 0, 0)
 

</style>
