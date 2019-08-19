<template>
    <transition name="slide">
        <div class="rank-list-detail">
             <music-list :songs="songs" :title="title" :bg-image="bgImage" :rank="true"></music-list>
        </div>
     </transition>
</template>

<script>
  import  {   mapGetters  } from 'vuex'
  import  musicList        from '@/components/musicList/musicList'

  import  { getRankDetail } from '@/api/rank.js'
  
  import { createSingerSong } from '@/common/js/song.js'
  import {  getSongVkey} from '@/api/singer.js'
  
   export default {
     	data(){
     		return {
     			songs:[]
     		}
     	},
         created(){
         	this.getSongList()
         },
     	methods:{
     		getSongList(){
                
                 if( !this.topList.id ){
                 	this.$router.push({
                         path: '/rank'
                       })
                 	return ;
                 }
                 
                 getRankDetail( this.topList.id ).then((res) => {
                   if (res.code === 0) {
                      this.songs = this._formatSongs(res.songlist)
                   }
                 })
     		  
     		},
           	_formatSongs (list) {
           		      let result = []
           		      list.forEach((item) => {
                             let musicData = item.data
                              getSongVkey( musicData.songmid ).then((res) => {
                                                  const vkey = res.data.items[0].vkey
                                                  if ( musicData.songid && musicData.albummid ) {
                                                      result.push( createSingerSong(musicData, vkey) )
                                                  }
                                        })
           				
           		      })
    
           		      return result
           		    
           		  },
     	},
     	 components: { musicList },
         computed:{
         	 ...mapGetters(['topList']),
     		 // 传入子组件
     		    title() {
                      
     		      return this.topList.topTitle
     		    },
     		    bgImage() {
                   // 如果当前的songs 里面获得了数据，就将 bgImage 替换为第一个album的封面
                  if(this.songs.length) {
                        return this.songs[0].img
                  }  
     		      return this.topList.picUrl
     		    }
         }
     }
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.slide-enter-active ,.slide-leave-active
      transition: all .3s ease;
.slide-enter, .slide-leave-to 
     opacity: 0
     transform: translate3d(100%, 0, 0)
 
.rank-list-detail 
     position: fixed;
     z-index: 100;
     top: 0;
     left: 0;
     right: 0;
     bottom: 0;
     background: $color-background;
</style>
