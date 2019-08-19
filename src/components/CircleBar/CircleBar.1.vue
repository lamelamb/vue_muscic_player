<template>
	<div class="CircleBar" ref="CircleBar">
		<slot>
		</slot>
		<canvas ref="cb" class="cb_canvsa"></canvas>
	</div>
</template>

<script>
	  export  default {
		  name:'CircleBar',
			props:{
				cbWidth:{
					  type:Number,
					  default:42
				},
				percent:{
					  type:Number,
					  default:0
				},
				outTrackColor:{
					type:String,
					default:'#CECCC6'
				},
				innerTrackColor:{
					type:String,
					default:'#ffcd32'
				},
			},
			watch:{
				percent(){
					  this.draw();
				}
			},
			
			created(){
				   
			},
			mounted(){
				 this.init();
			},
			methods:{
				  // 内层圆环
				  draw(){
					   var Angel = 2*Math.PI*this.percent  + Math.PI/2*3;
					   this.context.strokeStyle = this.innerTrackColor;
					   
					   this.context.arc(this.circleX,this.circleX,this.circleR,Math.PI/2*3, Angel ,false);
					   this.context.stroke();
					   this.context.beginPath();
				  },
				  //重新开始
				  reStart(){
					 
					   
					  this.context.arc(this.circleX, this.circleX, this.circleR,0,2*Math.PI,false);
					  this.context.stroke();
					  
				  },
				  
				  init(){
					   // 获取画布对象
					  this.context = this.$refs.cb.getContext("2d");
					  // 规定画布的大小， 内部slot + lineWidth 
					  this.context.width = this.cbWidth + 10;
					  this.context.height = this.cbWidth + 10;
					 
					  // 计算圆心坐标和半径
					  this.circleX = this.cbWidth/2+2;
					  this.circleR = this.cbWidth/2 ;
					  
					  this.context.lineWidth = 2;  // 线条的宽度
					  
					   this.reStart()
					  
				  }
				  
			}
	  }
</script>

<style>
	.CircleBar{
		   position: relative;
		   display:flex;
		   align-items: center;
	}
	.cb_canvsa{
		position: absolute;
		top:50%;
		transform: translate(0 ,-21px);
	}
	
</style>
