/**
 * 单一状态树
 * vuex 操作顺序：state.js -> mutations-type.js -> mutations.js -> getters.js
 */
import { getStorage, getPlayStorage, getFavorite } from '@/common/js/store.js'


const playMode = {
  sequence: 0,     // 顺序播放
  loop: 1,         // 单曲循环
  random: 2        // 随机播放
}
const state = {
  // 歌手信息
  singer: {},
  // 播放器播放状态
  playing: false,
  // 播放器展开状态
  fullScreen: false,
  // 播放歌曲列表
  playlist: [],
  // 顺序播放列表,存储最开始的播放顺序
  sequenceList: [],
  // 播放模式
  mode: playMode.sequence,
  // 当前播放歌曲索引
  currentIndex: -1,
  // 推荐页歌单
  songlist: {},
  // 歌曲排行数据
  rankList: {},
  // 搜索历史 ---- 从本地localstroage 中读取并设置初始值
  searchHistory: getStorage(),
  // 播放历史（最近播放）
  playHistory: getPlayStorage(),
  // 我的收藏
  favoriteList: getFavorite(),
   // 推荐页 专辑信息
  disc: {},
  // 排行榜页相关信息
  topList:{ }
	
}
export default state 