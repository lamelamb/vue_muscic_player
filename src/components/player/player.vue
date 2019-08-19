<template>
  <div class="player">
	   <transition name="normal">
		 <div class="normal-player" v-show="fullScreen">
			<div class="background">
				<img width="100%" height="100%" :src="currentSong.img">
			</div>
			<!-- 头部 -->
			<div class="top">
				<div class="back">
					<i class="icon-back" @click="back"></i>
				</div>
				<p v-html="currentSong.name" class="title"></p>
				<p v-html="currentSong.singer" class="subtitle"></p>
			</div>
           <!-- 中部 ,实现交互效果左滑，歌词也慢慢移动出现在视界，cd 页渐渐隐去，右滑动消失在视界，cd 页渐渐显示-->
			<div class="middle"  @click.stop 
			   @touchstart.prevent="middleTouchstart" @touchmove.prevent="middleTouchmove" @touchend.prevent="middleTouchend"
			   >
				<!-- 唱片 -->
				<div class="middle-l" ref="middleL" >
						 <div ref="cdRef" class="cd-wrapper">
								<!--  学习到了如何暂停一个动画, animation-play-state 不可简写 -->
							 <div :class="playing ? 'play' : 'play pause'" class="cd">
								 <img :src="currentSong.img" class="image">
							 </div>
						 </div>
 
						 <!-- cd页小段歌词，当前正在播放的单行歌词 -->
						 <div class="playing-lyric-wrapper">
							 <div class="playing-lyric">{{ playingLyric }}</div>
						 </div>
				</div>
				<!-- 
				    歌词页面可以滚动的条件是内部的内容高度大于容器高度，我给scroll 设置了middle-r 规定了高度
					通过data 属性一变化 ，重新渲染 scroll ，也就是重新计算高度
				-->
					<Scroll  class="middle-r"   :data="currentLyric && currentLyric.lines" ref="lyricList">
							<div  class="lyric-wrapper">
								<div  v-if="currentLyric">
										<p class="text"    v-for="(line,index) in currentLyric.lines" 
										   ref="lyricLine"    :class="{'current':currentLyricLine===index}">
											  {{ line.txt}}
										</p>
								</div>	
							</div>								 
					</Scroll>
					
			 </div>	
			<!-- 底部 -->			 
			<div class="bottom">
						<div  class="dot-wrapper" >
							   <div  class="dot" :class="{'active':currentDot==='cd'}"></div>
							   <div  class="dot" :class="{'active':currentDot==='lyric'}"></div>
						</div>
				       <div  class="progress-wrapper">
							 <ProcessBar   :currentTime="currentTime" :totalTime="currentSong.duration" 
							               @changeCurrentTime="changeCurrentTime">
							 </ProcessBar>
						</div>
				   <!-- 底部操作区 -->
				   <div class="operators">
				   	<div  class="icon i-left"  @click="changeMode">
				   		<i :class="iconMode"></i>
				   	</div>
				   	<div class="icon i-left"  @click="prevSong"  :class="songCanplay ? '' : 'disable'">
				   		<i  class="icon-prev"></i>
				   	</div>
				   	<div class="icon i-center" :class="songCanplay  ? '' : 'disable'">
				   		<i   @click="togglePlaying" :class="playing ? 'icon-pause' : 'icon-play'"></i>
				   	</div>
				   	<div class="icon i-right"  @click="nextSong"  :class="songCanplay  ? '' : 'disable'">
				   		<i class="icon-next"></i>
				   	</div>
				   	<div class="icon i-right">
				   		<i class="icon" :class="getFavoriteCls(currentSong)"  @click="toggleFavoriteCls(currentSong)"></i>
				   	</div>
				   </div>     
		    </div>		
		</div>
		</transition>
		
		<transition name="mini">
					<div @click="open"  class="mini-player" v-show="!fullScreen">
			         <!--  circle 旋转效果    -->
						<div class="icon">
							  <img :class="playing ? 'play' : 'play pause'" :src="currentSong.img" width="40" height="40">
						</div>
						
						<div class="text">
							<p v-html="currentSong.name" class="name"></p>
							<p v-html="currentSong.singer" class="desc"></p>
						</div>
						
						<!--  播放按钮，不方便让svg  定位就让icon定位啊，傻瓜
                           阻止冒泡，防止点击到 mini-player 上造成大小播放器切换
                        -->
						<div class="control"   @click.stop="togglePlaying">
							<CircleBar :radius="32" :percent="percent">
									<i  class="icon-mini"  :class="playing ?'icon-pause-mini' : 'icon-play-mini'"   ></i>
							</CircleBar>
						</div>
				        <!--  打开播放列表 -->
						<div class="control" @click.stop="showPlaylist">
							  <i class="icon-playlist"></i>
						</div>
					</div>
		</transition>
		
		 <my-playlist ref="playlistRef"></my-playlist>

		<!-- 播放器,注意play 事件类似事件onplaying 而表示缓冲至可播放状态
		    禁止用户频繁点击应该使用 canplay
            将canplay 改成 play 事件，保证先执行play 然后才触发songCanplay 标志位的改变
		 -->
		<audio ref="audioRef"
					@play="canplay"
					@error="error"
					@timeupdate="timeupdate"
					@ended="ended"
					:src="currentSong.url">Your browser does not support the audio element.
		</audio>
	</div>
</template>

<script>
	
	
	import { mapGetters, mapMutations, mapActions } from 'vuex'
	import MyPlaylist from '@/components/MyPlaylist/MyPlaylist'
	import  ProcessBar from '@/components/ProcessBar/ProcessBar'
	import  CircleBar from '@/components/CircleBar/CircleBar'
	import  Scroll from '@/base/scroll/scroll'
	import { myArray } from '@/common/js/myutils.js'
	import Lyric from 'lyric-parser'
	export default {
		data() {
			return {
				// 标志位。歌曲已缓存好，可以播放了
				songCanplay: false,
				// 当前播放时间
				currentTime: 0,
				// 当前的歌词
				currentLyric: null,
				// 当前的歌词在第几行
				currentLyricLine: 0,
				// 当前在哪个分页 --- ? 什么用？ 
				currentDot: 'cd',
				// cd页小段歌词
				playingLyric: '',
				// 是否显示播放列表
				showList: false
			}
		},
		components: {
			MyPlaylist , ProcessBar , CircleBar,Scroll
		},
		computed: {
			...mapGetters(['fullScreen', 'playlist', 'currentSong', 'playing', 'currentIndex',  'mode', 'sequenceList', 'favoriteList']),
			// props down，播放进度
			percent() {
				return this.currentTime / this.currentSong.duration
			},
			// 播放模式对应图标字体
			iconMode () {
				let cls = ''
				if (this.mode === 0) {
					cls = 'icon-sequence'
				} else if (this.mode === 1) {
					cls = 'icon-loop'
				} else if (this.mode === 2) {
					cls = 'icon-random'
				} else {
					cls = ''
				}
				return cls
			}
		},
		created(){
			    // 杯子变量，记录一下 在middle 部分移动的数据
			    this.middleTouchData ={}
		},
		watch: {
		    
		    // 播放 or 暂停,监听 playing(vuex) 计算属性 
		    playing(newVal) {
					
		      const audio = this.$refs.audioRef
		      this.$nextTick(() => {
		        newVal ? audio.play() : audio.pause()
		      })
		    },
				// 当前歌曲发生改变的时候重新获取歌词
		     currentSong(newSong ,oldSong){
                    if(!newSong.id ) return ;
					if(newSong.id == oldSong.id) return ;
					// 切换歌曲的时候，清除上一个currentLyric 实例内部的定时器
					if(this.currentLyric){
                        this.currentLyric.stop()
                    }  
					
					// 为什么不适用$nextTick ，因为在手机端被切回后台的时候， js 不会执行，但是audio 让然播放，如果正好到下一首 songReady 就不会被设置为true,后续逻辑无法进行
					// 不管你切多少次，只执行最后一次播放
                    clearTimeout( this.timer );
                    this.timer = setTimeout(()=>{
						  this.$refs.audioRef.play()
						   this.getLyric()
					 },1000)
					 
				}
					
				
		  },
		methods: {
			...mapMutations({
				setfullScreen: 'SET_FULL_SCREEN',
				setPlayingState: 'SET_PLAYING_STATE',
				setCurrentIndex: 'SET_CURRENT_INDEX',
				setMode: 'SET_MODE',
				setPlayList: 'SET_PLAYLIST'
			}),
			...mapActions(['saveplayHistory', 'savefavoriteList', 'delfavoriteList']),
			
			toggleFavoriteCls(song) {
				if (this._isFavorite(song)) {
					this.delfavoriteList(song)
				} else {
					this.savefavoriteList(song)
				}
			},
			getFavoriteCls(song) {
				if (this._isFavorite(song)) {
					return 'icon-favorite'
				} else {
					return 'icon-not-favorite'
				}
			},
			
			 _isFavorite(song) {
			      let index = this.favoriteList.findIndex((item) => {
			        return song.id === item.id
			      })
			      return index > -1
			    },
			
			// 最小化播放器
			back() {
				this.setfullScreen(false)
			},
			// 最大化播放器
			open() {
				this.setfullScreen(true)
			},
			
			// audio API canplay 当浏览器可以播放音频/视频时，更新this.songCanplay
			canplay(e) {
				
				this.songCanplay = true;
				// 把当前歌曲写进 vuex 最近播放 playHistory 中
				 this.saveplayHistory(this.currentSong)
				
			},
			// audio API error 当在音频/视频加载期间发生错误时
			// 当触发错误的时候任然也要保障正常使用
			error() {
				this.songCanplay = true;
			},
			// audio API timeupdate  当目前的播放位置已更改时
			// HTML5 Audio/Video 属性 currentTime  设置或返回音频/视频中的当前播放位置（以秒计）
			timeupdate(e) {
				this.currentTime = e.target.currentTime
			},
			
			// 进度条拖动歌曲播放进度
			changeCurrentTime(sec){
				   
				   this.$refs.audioRef.currentTime = sec ;
				   
				   // seek 的单位是毫秒
				   if(this.currentLyric){
					   this.currentLyric.seek(sec*1000);
				   }
				 
				   
			},
			
			// audio API ended  当前歌曲播放完毕
			ended() {
             
				if (this.mode === 1 ) {
					// 单曲循环模式
					this.loopSong()
				} else {
					  this.nextSong()
				}
				
			},
			// changeMode 切换播放模式,切换播放模式的时候当前 歌曲不改变
			 changeMode(){
				   let  mode  = (this.mode + 1) % 3 ;
				   this.setMode( mode);
					 
					 let newList = null
					if (mode === 2) {
					  // 随机播放
					  newList = myArray.shuffle(this.sequenceList)
					} else {
					  // 顺序播放、单曲循环
					  newList = this.sequenceList
					}
					 
					  // 调整当前歌曲的索引
					 let index = newList.findIndex((item) => {
					   return item.id === this.currentSong.id
					 })
					 this.setCurrentIndex(index)
					 this.setPlayList(newList)
					 
					 
				 },
			// 播放按钮
			togglePlaying() {
				     // 不能播放
			      if (!this.songCanplay) {
			        return
			      }
			
			     // 更改vuex的palying 状态
			      this.setPlayingState(!this.playing)
			
			      // 暂停时，歌词也暂停
			      if (this.currentLyric) {
			        this.currentLyric.togglePlay()
			      }
			    },
			// 显示播放列表
			showPlaylist() {
				this.$refs.playlistRef.show();
			},		
				// 循环播放
			loopSong(){
						   this.$refs.audioRef.currentTime = 0
						   this.$refs.audioRef.play()
						   // 循环，歌词也要重置到0 
						   if (this.currentLyric) {
						     this.currentLyric.seek(0)
						   }
					},
			 // 播放下一首		
			nextSong(){
				   // 只有当前歌曲加载完了之后才能加载一首避免用户快速点击，导致audio加载请求 bug 
				    if (!this.songCanplay) {
				     return
				   }
				   //播单长度为1 ，下一曲就是循环
				   if(this.playlist.length===1){
					     return this.loopSong()
				   }
				    var index  =  this.currentIndex +1; 
                     if (index === this.playlist.length) {
                      index = 0
                    }
                    this.setCurrentIndex(index);
                    if (!this.playing) {
                      this.togglePlaying()
                    }

					this.songCanplay = false;
						},
			// 播放前一首			
				prevSong(){
					     if (!this.songCanplay) {
					       return
					     }
					     
					     let index = this.currentIndex - 1
					     if (index === -1) {
					       index = this.playlist.length - 1
					     }
					     this.setCurrentIndex(index)
					     if (!this.playing) {
					       this.togglePlaying()
					       this.songCanplay = false
					     }
							
			       } ,
						 // 封装获取歌词的方法，不直接写在watch currentSong 里面
					getLyric(){
						   this.currentSong.getLyric().then((lyric)=>{
                               // 还是异步的获取时机问题，必须保障lyric 和 currentSong.llyric 一致
							    if( this.currentSong.lyric !== lyric )   return ;
							 // 使用 Lyric-parser,初始化的时候传入一个回调，播放到对应时间就会调用一次回调函数
							this.currentLyric = new Lyric( lyric , this.handleLyric);
										
						    // 当前是播放状态让歌词自动播放	，当歌曲到时间的时候会自动调用我们注册的  this.handleLyric 函数
							  if(this.playing){
									this.currentLyric.play()
									}
							 
							 }).catch(()=>{
								   this.currentLyric = null
								   this.playingLyric=''
								   this.currentLyricLine = 0
							 })
					},
					// 歌词的每一行回调函数，1 滚动歌词一行 2 给当前行设置样式
					handleLyric({lineNum ,txt}){
						         this.currentLyricLine =lineNum;
								 // 让当前行永远在视觉的中心，大于5行则滚动，不大于则在顶部
								 if( lineNum > 5  ){
									     let  lineEl =   this.$refs.lyricLine[lineNum -5 ]
									    this.$refs.lyricList.scroll.scrollToElement( lineEl,1000 )
								 }else{
									    this.$refs.lyricList.scroll.scrollTo(0 , 0 ,1000)
								 }
								 
								 this.playingLyric = txt
						},
					// 在normal middle 滑动切换cd 和lyric
						middleTouchstart(e){
							this.middleTouchData.init= true;   
							this.middleTouchData.startX =  e.touches[0].pageX;
							this.middleTouchData.startY =  e.touches[0].pageY;
						},
						middleTouchmove(e){
							if(!this.middleTouchData.init ) return ;   
							var touch =  e.touches[0];
							var deltX = touch.pageX - this.middleTouchData.startX ;
							var deltY = touch.pageY - this.middleTouchData.startY ;
							
							// 因为我们的lyric 也是滑动 ，所以竖直方向移动距离大于水平方向的时候不应该是切换页面而是滚动歌词
							if( Math.abs( deltY ) > Math.abs(deltX ) ) return ;
							
							// 思维方式的不一样，只考虑lyric 页面的最值，然后通用计算它距离屏幕右边的距离，左滑还是右滑的情况呗概括了
							const left = this.currentDot === 'cd' ? 0:-window.innerWidth;
							var offsetWidth = Math.min(0, Math.max(-window.innerWidth ,  left+deltX ))
							
						    this.middleTouchData.percent = Math.abs(offsetWidth/window.innerWidth).toFixed(2);
							
							// move 的时候不使用动画 
							this.$refs.lyricList.$el.style.transform = `translate3d(${offsetWidth}px,0,0)`;
							this.$refs.lyricList.$el.style.transition = `0s`;
							
							// 设置cd 页面的透明度
							this.$refs.middleL.style.opacity = 1-this.middleTouchData.percent;
							this.$refs.middleL.style.transition = `0s`;
						},
						middleTouchend(e){
							// 体验优化
							let offsetWidth ;
							let opacity;
							if(this.currentDot == 'cd'){
								 // 此时只有左滑，才能让percent 不是0 , 滑动比例大于0.1 自动滑动
								  if( this.middleTouchData.percent > 0.1){
									   offsetWidth = -window.innerWidth;
									   this.currentDot = 'lyric'
									   opacity = 0
								  }else{
									   offsetWidth = 0;
									   opacity = 1
								  }
							}else{
								// 同理，此时只有向右边滑动才能让percent 小于1 ，因为你再往左滑，percent 一直被设置成1 
								if( this.middleTouchData.percent < 0.9){
										offsetWidth = 0;
										this.currentDot = 'cd'
										opacity = 1
								}else{
										 offsetWidth = -window.innerWidth;
										 opacity = 0
								}
							}
							
							this.$refs.lyricList.$el.style.transform = `translate3d(${offsetWidth}px,0,0)`;
							this.$refs.lyricList.$el.style.transition = `0.3s`;
							
							this.$refs.middleL.style.opacity = opacity;
							this.$refs.middleL.style.transition = `0.3s`;
							// this.middleTouchData.init= false;
						},
					
			
			}
		
	}
</script>

<style lang="stylus" scoped>
  @import '~common/stylus/variable'
  @import '~common/stylus/mixin'
  
 .player 
   .normal-player 
     position: fixed;
     left: 0;
     right: 0;
     top: 0;
     bottom: 0;
     z-index: 150;
     background: $color-background;
     .background 
       position: absolute;
       left: 0;
       top: 0;
       width: 100%;
       height: 100%;
       z-index: -1;
       opacity: 0.6;
       filter: blur(20px);
     
     .top 
       position: relative;
       margin-bottom: 25px;
       .back 
         position: absolute;
         top: 0;
         left: 6px;
         z-index: 50;
         .icon-back 
           display: block;
           padding: 9px;
           font-size: $font-size-large-x;
           color: $color-theme;
           transform: rotate(-90deg);
        
       .title 
         width: 70%;
         margin: 0 auto;
         line-height: 40px;
         text-align: center;
         @include no-wrap();
         font-size: $font-size-large;
         color: $color-text;
       
       .subtitle 
         line-height: 20px;
         text-align: center;
         font-size: $font-size-medium;
         color: $color-text;
     
     .middle 
       position: fixed;
       width: 100%;
       top: 80px;
       bottom: 170px;
       white-space: nowrap;
       font-size: 0;
       .middle-l 
         display: inline-block;
         vertical-align: top;
         position: relative;
         width: 100%;
         height: 0; 
         padding-top: 80%;  
         .cd-wrapper 
           position: absolute;
           left: 10%;
           top: 0;
           width: 80%;
           height: 100%;
           .cd 
             width: 100%;
             height: 100%;
             box-sizing: border-box;
             border: 10px solid rgba(255, 255, 255, 0.1);
             border-radius: 50%;
             &.play 
               animation: rotate 20s linear infinite;
             
             &.pause 
               animation-play-state: paused;
               -webkit-animation-play-state:paused;
             
             .image 
               position: absolute;
               left: 0;
               top: 0;
               width: 100%;
               height: 100%;
               border-radius: 50%;
         
         .playing-lyric-wrapper 
           width: 80%;
           margin: 30px auto 0 auto;
           overflow: hidden;
           text-align: center;
           .playing-lyric 
             height: 20px;
             line-height: 20px;
             font-size: $font-size-medium;
             color: $color-text-l;
           
       .middle-r 
         display: inline-block;
         vertical-align: top;
         width: 100%;
         height: 100%;
         overflow: hidden;
         .lyric-wrapper 
           width: 80%;
           margin: 0 auto;
           overflow: hidden;
           text-align: center;
           .text 
             line-height: 32px;
             color: $color-text-l;
             font-size: $font-size-medium;
            .current 
               color: $color-text;
           
     .bottom 
       position: absolute;
       bottom: 50px;
       width: 100%;
       .dot-wrapper 
         text-align: center;
         font-size: 0;
         .dot 
           display: inline-block;
           vertical-align: middle;
           margin: 0 4px;
           width: 8px;
           height: 8px;
           border-radius: 50%;
           background: $color-text-l;
           &.active 
             width: 20px;
             border-radius: 5px;
             background: $color-text-ll;
       
       .progress-wrapper 
         display: flex;
         align-items: center;
         margin: 0px auto;
         padding: 10px 0;
         .time 
           color: $color-text;
           font-size: $font-size-small;
           flex: 0 0 30px;
           line-height: 30px;
           width: 30px;
           &.time-l 
             text-align: left;
             margin-right: 5px;
           
           &.time-r 
             text-align: right;
             margin-left: 5px;
          
         .progress-bar-wrapper 
           flex: 1;
        
       .operators 
         display: flex;
         align-items: center;
         .icon 
           flex: 1;
           color: $color-theme;
           &.disable 
             color: $color-theme-d;
           i 
             font-size: 30px;
          
         .i-left 
           text-align: right;
         
         .i-center 
           padding: 0 20px;
           text-align: center;
           i 
             font-size: 40px;
          
         .i-right 
           text-align: left;
         
         .icon-favorite 
           color: $color-sub-theme;
         
     &.normal-enter-active, &.normal-leave-active 
       transition: all 0.4s;
       .top, .bottom  
         transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
      
			 
     &.normal-enter, &.normal-leave-to 
       opacity: 0;
       .top 
         transform: translate3d(0, -100px, 0);
       
       .bottom 
         transform: translate3d(0, 100px, 0);
			 
        
   .mini-player 
     display: flex;
     align-items: center;
     position: fixed;
     left: 0;
     bottom: 0;
     z-index: 180;
     width: 100%;
     height: 60px;
     background: $color-highlight-background;
     &.mini-enter-active, &.mini-leave-active 
       transition: all 0.4s;
     
     &.mini-enter, &.mini-leave-to 
       opacity: 0;
     
			 
     .icon 
       flex: 0 0 40px;
       width: 40px;
       height:40px;
       padding:0 10px 0 20px;
       img 
         border-radius: 50%;
         &.play 
           animation: rotate 10s linear infinite;
         
         &.pause 
           animation-play-state: paused;
     .play
				  font-size:30px;
     .text 
       display: flex;
       flex-direction: column;
       justify-content: center;
       flex: 1;
       line-height: 20px;
       overflow: hidden;
       .name 
         margin-bottom: 2px;
         no-wrap();
         font-size: $font-size-medium;
         color: $color-text;
       
       .desc 
         no-wrap();
         font-size: $font-size-small;
         color: $color-text-d;
      
     .control 
       flex: 0 0 30px;
       width: 30px;
       padding: 0 10px;
       .icon-play-mini, .icon-pause-mini, .icon-playlist 
         font-size: 30px;
         color: $color-theme-d;
       .icon-mini 
         font-size: 32px;
         position: absolute;
         left: 0;
         top: 0;

@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}     
	
</style>
