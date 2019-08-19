<!-- 歌手页组件 -->
<template>
  <div class="my-singer" ref="singerRef">
     <my-phone-list :data="singerList" @select="selectSinger" ref="phoneList"></my-phone-list>
     <!-- 子路由 出口 -->
     <router-view></router-view>
  </div>
</template>

<script>
import { getSingerList } from 'api/singer'
import { createSinger } from '@/common/js/SingerClass.js'
import { ERR_OK } from 'api/config'
import scroll from '@/base/scroll/scroll'
import MyPhoneList from '@/base/MyPhoneList/MyPhoneList'
import { playlistMixin } from '@/common/js/mixin.js'
// 设置vuex 的数据
import { mapMutations} from 'vuex'


const HOT_NAME = '热门'
const HTO_NUM = 10
export default {
   mixins: [playlistMixin],
  data() {
    return {
      singerList: []
    }
  },
  created() {
      this._getSingerList()
  },
  components: {
	    scroll,
	    MyPhoneList,
    },
  methods: {
  	
		 // 当有迷你播放器时，调整滚动底部距离
		handlePlaylist(playlist) {
		  let bottom = playlist.length > 0 ? '60px' : ''
		  this.$refs.singerRef.style.bottom = bottom
		
		  this.$refs.phoneList.refresh()
		},
		
    _getSingerList() {
      getSingerList().then((res) => {
        if (res.code === ERR_OK) {
          this.singerList =  this._normalizeSinger (res.data.list)
        }
      })
    },
    // 重组 res.data.list 数据，聚合排序取前十
    _normalizeSinger (list) {
      // 热门歌手,定义一个map 结构
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      }

      // 填充歌手数据
      list.forEach((item, index) => {
        // 填充热门歌手数据,前十条定义为热门数据
        if (index < HTO_NUM) {
          map.hot.items.push(createSinger(item))
        }

        // 填充 a-z 字母，但是得到的map 的key 还是无序的
        let key = item.Findex
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }

        // 填充对应字母歌手数据
        map[key].items.push(createSinger(item))
      })

      // 处理map, 得到有序列表,分成热门和非热门
      let hot = []
      let others = []

      for (let key in map) {
        let value = map[key]
        if (value.title.match(/[a-zA-Z]/)) {
          others.push(value)
        } else if (value.title === HOT_NAME){
          hot.push(value)
        }
      }
        // a-z 升序
      others.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })

      // 最终的数据是一个有序的一维数组，先热门 然后 名字为的a 的歌手们，b 歌手。。。
      return hot.concat(others)
    },
    
    // 接受事件，点击歌手-- 跳转路由，获取数据
    selectSinger(singer){
    	  
    	  this.$router.push({
    	  	 path: `/singer/${singer.id}`
    	  })
    	  
    	   this.setSinger( singer )
    },
    
     // 将mutations 映射为方法，就不要写  store.commit('SET_SINGER') 了
      ...mapMutations({
      	  setSinger: 'SET_SINGER'
      }),
  }

}
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.my-singer 
  position: fixed
  top: 88px
  bottom: 0
  width: 100%

</style>
