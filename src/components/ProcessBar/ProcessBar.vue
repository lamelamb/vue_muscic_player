<template>
	<div class="procesbar">
		<span>{{ currentTimeFromated }}</span>
		<div class="trackWrapper" @click.stop="jumpTime" ref="trackWrapper">
			  <div class="track" ref="track"></div>
			  <div class="thumb" ref="thumb" @click.stop  
				@touchstart.stop="thumbTouchstart" @touchmove.stop="thumbTouchmove" @touchend.stop="thumbTouchend"
				></div>
		</div>
		<span>{{ totalTimeFromated }}</span>
	</div>
</template>

<script>
	  export  default {
		  name:'ProcessBar',
			props:{
				 currentTime:{
					 type:Number,
					 default:function (){
						  return 0;
					 }
				}  ,
				totalTime:{
					 type:Number,
					 default:function (){
						  return 0;
					 }
				}  ,
			},
			computed:{
				currentTimeFromated (){
					   return this.timeFormat( this.currentTime );
				},
				 totalTimeFromated(){
					  return this.timeFormat( this.totalTime );
				 }
			},
			watch:{
				// 监控 currentTime 变化
				currentTime ( newVal ,oldVal ){
					       // 当我在拖动的时候不进行自动监控的操作
								 if(this.touchPosition.flag) return;
								 
					       var percent =   newVal / this.totalTime;
							   var disX =	Math.ceil((this.$refs.trackWrapper.clientWidth -8)*percent);
								 
									this.$refs.track.style.width= disX + "px";
								  this.$refs.thumb.style.left= disX + "px";
									
				}
			},
			created(){
				    this.touchPosition = {}
			},
			mounted(){
						
				  
			},
			methods:{
				
				//  滑块触摸滑动,以滑块的中心为起点 ，不需要每次都计算  16/2 , 也就是默认用户就正好触摸到thumb 的中心点上
				thumbTouchstart(e){
					    this.touchPosition.flag = true ;
					    // 鼠标距里滑块左边的距离，也就是鼠标点在 滑块的什么地方，一旦按下是不变的
					    this.touchPosition.offsetThumbX = 8;
							this.touchPosition.trackWrapperX = this.$refs.trackWrapper.offsetLeft ;
					   // 触摸极限值，这时候 thumb 正好移动到 trackWrapper 的2端
						 this.touchPosition.max = this.touchPosition.trackWrapperX + this.$refs.trackWrapper.clientWidth -8 ;
					   this.touchPosition.min = this.touchPosition.trackWrapperX + 8 ;
					
					  // 鼠标距离body 左边的距离，按下初始位置
					  this.touchPosition.clientX = e.touches[0].clientX;
					
				},
				thumbTouchmove(e){
					   // 必须先经过touchStart 才能touchmove 
					  if(!this.touchPosition.flag) return;
					   var currentClientX = e.touches[0].clientX ;
					    
						 if( currentClientX >  this.touchPosition.max){
							    currentClientX =  this.touchPosition.max ;
						 }
					   if( currentClientX < this.touchPosition.min ){
							  currentClientX =  this.touchPosition.min ;
						 }
					
					  var disX = Math.ceil(currentClientX - this.touchPosition.trackWrapperX - this.touchPosition.offsetThumbX)  ;
						this.$refs.track.style.width= disX + "px";
						this.$refs.thumb.style.left= disX + "px";
				},
				thumbTouchend(){
					  // 更新
					 this.touchPosition.flag = false ;
					  // 拖曳到的歌曲播放时刻
						this.$emit('changeCurrentTime' , this.clacCurrentSeconds())
					
				},
				// 计算拖曳到了歌曲的播放时刻，返回一个秒数
				clacCurrentSeconds(){
					    var sec = this.$refs.thumb.offsetLeft/(this.$refs.trackWrapper.clientWidth-16) * Math.ceil( this.totalTime ) 
				       return  Math.ceil(sec) ;
				},
				
				// 点击trackWrapper 跳转
				jumpTime(e){
					   if( !this.trackWrapperPosition){
							    this.trackWrapperPosition ={
										       clientWidth: this.$refs.trackWrapper.clientWidth,
													 offsetLeft:this.$refs.trackWrapper.offsetLeft
									} 
						 }
					 // thumb 默认1rem ,所以正式开发应该获取 html 的fontSize  大小
 					  var  disX  = e.clientX - this.trackWrapperPosition.offsetLeft;
						var minDisX = 0 ;
						var maxDisX = this.trackWrapperPosition.clientWidth - 16;
						
						
						if(disX< minDisX){
							  disX = 0;
						}
						if( disX > maxDisX  ){
							  disX = maxDisX;
						}
					  this.$refs.track.style.width= disX + "px";
						this.$refs.thumb.style.left= disX + "px";
					
					 this.$emit('changeCurrentTime' , this.clacCurrentSeconds())
				},
				
				 // 将秒转化成 00：00 格式
				 timeFormat(seconds){
					     seconds = Math.ceil(seconds);
						var min =  Math.floor( seconds  / 60 );
						var sec = seconds  - min*60;
						 min> 9?null:min='0'+min+':';
						 sec> 9?null:sec='0'+sec;
						return  min+sec;
				 }
			}
	  }
</script>

<style>
	.procesbar{
		   display:flex;
		   width: 100%;
	}
	.procesbar>span{
		flex:1;
	}
	.procesbar>span{
		padding:0 0.5em;
	}
	
	.procesbar>div{
		flex:8;
	}
	.trackWrapper{
		position: relative;
		height: 1em;
		background-color: #3c3c3c;
		border: 1px solid;
		width: 100%;
		border-radius: 8px;
	}
	.trackWrapper .track{
		   height:100%;
			 border-radius: 8px 0px 0px 8px /8px;
			 background-color: #ffcd32;
	}
	 .trackWrapper .thumb{
		  width:1rem;
		  height:1rem;
			display: inline-block;
		  border-radius:50%;
		  background: white;
		  position: absolute;
			top:0;
	 }
</style>
