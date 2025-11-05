<template>
		<text :style="{ color: color, 'font-size': iconSize }" @click="_onClick" class="uni-im-icons">{{unicode}}</text>
</template>

<script>
	const getVal = (val) => {
		const reg = /^[0-9]*$/g
		return (typeof val === 'number' ||　reg.test(val) )? val + 'px' : val;
	} 
	export default {
		emits:['click'],
		data() {
			return {
				
			}
		},
		props: {
			code: {
				type: String,
				default(){
					return ''
				}
			},
			color: {
				type: String,
				default: '#333333'
			},
			size: {
				type: [Number, String],
				default: 16
			},
		},
		computed:{
			unicode(){
				return unescape(`%u${this.code}`)
			},
			iconSize(){
				return getVal(this.size)
			}
		},
		methods:{
			_onClick(e) {
				this.$emit('click',e)
			}
		}
	}
</script>

<style>
.uni-im-icons {
  font-family: uni-im-icons !important;
  font-size: 16px;
  font-style: normal;
  /* #ifdef H5 */
  cursor: pointer;
  /* #endif */
}
@font-face {
  font-family: "uni-im-icons"; /* Project id 3726059 */
  src: url('https://at.alicdn.com/t/c/font_3726059_aoe3vlbh3os.ttf?t=1729588562823') format('truetype');
}
.uni-im-share:before {
  content: "\e6c4";
}

.uni-im-copy:before {
  content: "\e67e";
}

.uni-im-delete:before {
  content: "\e63d";
}
</style>
