<template>
  <div id="app">
  	<m-header></m-header>
  	<tab></tab>
		<!--  为了 切换回4大一级路由 不刷新，不重新发请求 -->
  	<keep-alive>
  	      <router-view/>
  	</keep-alive>
		<!-- player 在任何地方都可以打开，所以是根组件 -->
		<player v-show="playlist.length"></player>
  </div>
</template>

<script>
import { mapGetters  } from 'vuex'
import MHeader from './components/m-Header/m-header'
import tab from './components/tab/tab'
import player from '@/components/player/player'
export default {
  name: 'App',
	computed:{
		...mapGetters([ 'playlist', ]),
	},
  components:{
  	 MHeader ,tab ,player
  }
}
</script>

<style lang="stylus">
@import './common/stylus/index'

#app 
    color:$color-theme


   
</style>
