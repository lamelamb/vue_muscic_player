<!-- 搜索建议页列表组件 -->

<template>
  <scroll class="my-suggest-list"
             ref="scrollRef"
             :data="result"
             :beforeScroll="beforeScrollData"
             @beforeScroll="beforeScroll"
             :pullup="pullup"
             @scrollToEnd="scrollToEnd">
    <ul class="suggest-list">
      <li class="suggest-item" v-for="item in result" @click="selectItem(item)">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>

        <div class="name">
          <p class="text" v-html="getSingernameOrSongname(item)"></p>
        </div>
      </li>
      <!--  title 必须要穿，覆盖默认值 -->
      <MyLoading v-show="hasMore" title=""></MyLoading>
    </ul>
     <!--  对于组件，不管是loading 还是提示，包一层div 是为了对组件整体在父组件中的 位置，显示做出限制 -->
    <div class="no-result-wrapper" v-if="!hasMore && !result.length">
      <my-no-result></my-no-result>
    </div>
  </scroll>
</template>

<script>
 
import scroll from '@/base/scroll/scroll'
import MyLoading from '@/base/MyLoading/MyLoading'
import MyNoResult from '@/base/MyNoResult/MyNoResult'
import { search } from '@/api/search.js'
import { createSingerSong } from '@/common/js/song.js'
import { Singer } from '@/common/js/SingerClass.js'
import { mapMutations, mapActions } from 'vuex'

const TYPE_SINGER = 'singer'

export default {
  components: {
    scroll,
    MyLoading,
    MyNoResult
  },
  data () {
    return {
      // 当前检索页数，用于下拉加载
      page: 1,
      // 每一页的数量
      perpage: 20,
      // 接受检索结果
      result: [],
      // 标志位。是否加载完
      hasMore: true,
      beforeScrollData: true,
      pullup: true
    }
  },
  props: {
    // 接受的检索值
    query: {
      type: String,
      default: ''
    },
    // 是否显示歌手
    zhida: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    query(newVal) {
      if(newVal){
         this.search()
      }
      
    }
  },
  filters: {},
  methods: {
    // vuex
    ...mapMutations({
      'setSinger': 'SET_SINGER'
    }),
    ...mapActions(['insertSong']),
    search() {
      this.page = 1
      this.hasMore = true
      this.$refs.scrollRef.scrollTo(0, 0)

      search(this.query, this.page, this.perpage, this.zhida).then((res) => {
        if (res.code === 0) {
          
          this.result = this._formatSearch(res.data)
          this._checkMore(res.data)
        }
      })
    },
    // 重组 res.data 数据 ,歌手直达部分 + 歌曲相关部分
    _formatSearch(data) {
      let ret = []

      if (data.zhida && data.zhida.singerid) {
        // 解构赋值
        ret.push({...data.zhida, ...{type: TYPE_SINGER}})
      }

      if (data.song) {
        ret = ret.concat(this._normalizeSongs(data.song.list))
      }

      return ret
    },
    // 格式化歌手信息
    _normalizeSongs(list) {
      let ret = []
      
      list.forEach((item) => {
        if (item.songid && item.albummid) {
          ret.push(createSingerSong(item))
        }
      })

      return ret
    },
    // 获取 icon class 图标样式
    getIconCls(item) {
      if (item.type === TYPE_SINGER) {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    
    getSingernameOrSongname(item) {
      if (item.type === TYPE_SINGER) {
        return item.singername
      } else {
        return `${item.name}-${item.singer}`
      }
    },
    scrollToEnd() {
      
      if (!this.hasMore) {
        return
      }

      this.page ++
      search(this.query, this.page, this.perpage, this.zhida).then((res) => {
        if (res.code === 0) {
          this.result = this.result.concat(this._formatSearch(res.data))
          this._checkMore(res.data)
        }
      })
    },
    // 路由跳转逻辑
    selectItem(item) {
      if (item.type === TYPE_SINGER) {
        let singer = new Singer({
          id: item.singermid,
          name: item.singername
        })

        this.$router.push({
          path: `/search/${singer.id}`
        })

        this.setSinger(singer)
      } else {
        this.insertSong(item)
      }
     // suggest 的组件 不应该包含 存储历史的动作，只需要派发出去，通知关心的人处理就行了
      this.$emit('select')
    },
    // 什么时候不上拉刷新
    _checkMore(data) {
      let song = data.song
      // 没有数据或最后一页
      if (!song.list.length || (song.curnum + song.curpage * this.perpage) > song.totalnum) {
        this.hasMore = false
      }
    },
    // 滚动前触发事件
    beforeScroll() {
      this.$emit('beforeScroll')
    },
    // 给父亲用
    refresh() {
      this.$refs.scrollRef.refresh()
    }
  },
  computed: {},
  created () {},
  mounted () {},
  destroyed () {}
}
</script>

<style lang="stylus" scoped>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'


.my-suggest-list 
  height: 100%;
  overflow: hidden;
  .suggest-list 
    padding: 0 30px;
    .suggest-item 
      display: flex;
      align-items: center;
      padding-bottom: 20px;
    
    .icon 
      flex: 0 0 30px;
      width: 30px;
      [class^="icon-"] 
        font-size: 14px;
        color: $color-text-d;
     
    .name 
      flex: 1;
      font-size: $font-size-medium;
      color: $color-text-d;
      overflow: hidden;
      .text 
           no-wrap();
      
  .no-result-wrapper 
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
 
</style>
