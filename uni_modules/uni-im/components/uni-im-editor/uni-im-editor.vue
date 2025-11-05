<template>
  <view class="uni-im-editor-box" @click="clickhandler">
    
    <!-- #ifdef MP -->
      <textarea class="uni-im-editor-mp" v-model="textareaValue" @input="oninput" auto-height :maxlength="maxlength"
        :show-confirm-bar="false" :adjust-position="false" @blur="lastCursor = $event.detail.cursor;isFocus = false"
				:cursor="lastCursor" @focus="isFocus = true" :focus="isFocus"
      ></textarea>
    <!-- #endif -->
    
    <!-- #ifndef MP -->
      <div class="uni-im-editor" ref="uni-im-editor" contenteditable="true" :inputmode="(hideKeyboard && systemInfo.platform != 'ios') ? 'none' : 'text'"></div>
      <!-- 与rmd通讯专用 -->
      <view :change:prop="rdm.$callMethod" :prop="callRmdParam"></view>
    <!-- #endif -->
    
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	import parseHtml from './parseHtml.js'
	import uploadHtmlArrayImgs from './uploadHtmlArrayImgs.js'
  export default {
    emits: ["input", "confirm", "change", "click"],
		computed: {
			...uniIm.mapState(['systemInfo'])
		},
    data() {
      return {
        callRmdParam: [],
        // #ifdef MP
        "textareaValue":this.modelValue,
        lastCursor:this.modelValue.length,
				isFocus:false
        // #endif
      }
    },
    props: {
			hideKeyboard: {
				type: Boolean,
				default: false,
			},
      modelValue: {
        type: [String, Object],
        default: ""
      },
      placeholder: {
        type: String,
        default: ""
      },
      maxlength: {
        type: Number,
        default: 140
      },
			// 回车直接发送
			enterSend: {
				type: Boolean,
				default: true
			}
    },
    // #ifdef MP
    watch: {
      textareaValue(val){
        this.$emit("change",{
          value:val
        })
      }
    },
    // #endif
    mounted() {
      // 与rmd通讯专用
      this.callRmd = async (funcName, ...params) => {
        // #ifdef MP
        switch (funcName){
          case '$setContent':
            this.textareaValue = params[0]
            break;
          case '$addHtmlToCursor':
            // 在第lastCursor位置添加内容
            setTimeout(()=>{
              this.textareaValue = this.textareaValue.slice(0,this.lastCursor) + params[0] + this.textareaValue.slice(this.lastCursor)
            },300)
            break;
          default:
            console.error('小程序暂不支持与rmd通讯',funcName,params)
            break;
        }
        return
        // #endif
        this.callRmdParam = []
        this.$nextTick(() => {
          return new Promise((resolve, reject) => {
            this.callRmdParam = [funcName, ...params,param=>{
              resolve(param)
            }]
          })
        })
      }
      
      // #ifndef H5
      // uni.onKeyboardHeightChange((res) => {
      //   console.log('键盘高度变化22222', res.height);
      //   if(res.height === 0){
      //     // console.error('@##键盘被收起，可以失去焦点')
      //     // this.callRmd('$blur')
      //   }
      // });
      // #endif
      
      // #ifdef H5
			const uniImEditors = document.querySelectorAll('.uni-im-editor');
      const uniImEditor = uniImEditors[uniImEditors.length - 1];
      uniIm.utils.appEvent.onAppActivate(() => {
        // 主窗口激活时设置输入焦点到这里的文本编辑框
        uniImEditor.focus()
      })
      let shiftIsDown = false;
      window.addEventListener('keydown', (e) => {
        if (e.key == 'Shift') {
          shiftIsDown = true
        }
      })
      window.addEventListener('keyup', (e) => {
        if (e.key == 'Shift') {
          shiftIsDown = false
        }
      })

      let isComposing = false;
      // 输入法开始输入
      uniImEditor.addEventListener('compositionstart', () => {
        isComposing = true
        uniImEditor.isComposing = isComposing;
      });
      // 输入法结束输入
      uniImEditor.addEventListener('compositionend', () => {
        isComposing = false
        uniImEditor.isComposing = isComposing;
      });

      uniImEditor.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
					if (this.enterSend === true) {
						if (isComposing) {
						  console.log('输入法正在输入中，此时回车不发送消息')
						  event.preventDefault();
						} else {
						  if (shiftIsDown) {
						    console.log('shift键处于按下状态，为换行不是confirm发送')
						  } else {
						    this.$emit('confirm');
						    // 防止，回车执行发送的同时执行换行
						    event.preventDefault();
						  }
						}
					} else {
						// 默认的回车会导致多包一层div，不方便解析。这里阻止默认行为，自定义换行
						event.preventDefault();
						// 判断光标是否在当前富文本的末尾，注意：此编辑框不仅仅支持文本，还支持图片等，因此不能直接判断innerText的长度
						let cursorInLast = false
						const selection = window.getSelection();
						const range = selection.getRangeAt(0);
						const endContainer = range.endContainer;
						// 如果光标在最后一个子节点上
						if (endContainer === uniImEditor.lastChild) {
							const endOffset = range.endOffset;
							// console.log('光标偏移量',endOffset)
							if (endContainer.nodeType === 3) { // 文本节点
							// console.log('光标所在的是文本节点',endOffset,endContainer.textContent.length)
								cursorInLast = endOffset === endContainer.textContent.length;
							} else {
								// console.log('光标所在的不是文本节点',endOffset)
								cursorInLast = endOffset === 0;
							}
						} else {
							// console.log('光标不在最后一个“子节点“上')
						}
						// console.log('光标是否在末尾',cursorInLast)
						// 光标在末尾时，多补一个换行
						this.$addHtmlToCursor( "\n" + (cursorInLast ? "\n" : "") )
					}
        }
      });

      uniImEditor.addEventListener('paste', async event => {
        // 阻止默认行为
        event.preventDefault();
				
        // 删除选中的文本
        const selection = window.getSelection();
        if (!selection.isCollapsed) {  // console.log('选中文本', selection.toString());
          const range = selection.getRangeAt(0);
          range.deleteContents();
          selection.removeAllRanges();
        }
        
        //某些chrome版本使用的是event.originalEvent
        const clipboardData = event.clipboardData || event.originalEvent?.clipboardData;
        let htmlString = clipboardData.getData('text/html');
        console.log('paste',{htmlString});
        if (htmlString) {
          // 获取html字符串
          htmlString = await filterHTML(htmlString);
          console.log('htmlString222', htmlString);
          const tmpDom = document.createElement('div');
          tmpDom.innerHTML = htmlString;
          if (tmpDom.innerText.length > 50000) {
            uni.showModal({
              content: '你粘贴的文本长度超过50000，将被截断。',
              complete: e => {
                if (e.confirm) {
                  this.$addHtmlToCursor(htmlString.substring(0, 50000))
                }
              }
            });
          } else {
            this.$addHtmlToCursor(htmlString)
          }
          // 检查图片加载失败，删除图片
          const imgs = uniImEditor.querySelectorAll('img');
          for (const img of imgs) {
            img.onerror = () => {
              img.remove();
            }
          }
        } else {
          // 获取文本
          let clipboardDataText = clipboardData.getData('text/plain')
          if (clipboardDataText) {
						clipboardDataText = clipboardDataText.replace(/&/g, '&amp;')
																	.replace(/</g, '&lt;')
																	.replace(/>/g, '&gt;')
            this.$addHtmlToCursor(clipboardDataText)
          } else {
						// 获取剪切板中的文件
						const items = clipboardData.items;
						for (const item of items) {
							if (item.type.indexOf("image") !== -1) {
								const file = item.getAsFile();
								const blobUrl = URL.createObjectURL(file)
								console.log('blobUrl',blobUrl)
								this.$addHtmlToCursor(`<img src="${blobUrl}" />`)
							}
						}
					}
        }
      })

      async function filterHTML(htmlString) {
        // 过滤html字符串，只保留：文字，图片，链接
        // html字符串转dom对象，并深度遍历
        let tmpDiv = document.createElement('div');
        tmpDiv.innerHTML = htmlString;
        let arr = [];
        await deepTr(tmpDiv);
        // 销毁tmpDiv
        tmpDiv = null;
        return arr.join('');
        async function deepTr(node) {
          // console.log('node', node);
          if (node.nodeType === 1) {
            const action = {
              async IMG(){
                // 只保留src属性
                // 处理图片跨域问题
                if (node.src.indexOf('blob:http') != 0 && !node.src.includes('https://im-res.dcloud.net.cn')) {
                  const uniImCo = uniCloud.importObject("uni-im-co", {
                    loadingOptions: { // loading相关配置
                      title: '处理跨域图片...',
                      mask: true
                    }
                  })
                  let res = await uniImCo.getImgBase64(node.src)
                  function base64ToBlob(base64) {
                    // 将Base64字符串分割为数据和应用信息
                    const byteChars = atob(base64.split(',')[1]);
                    // 创建一个长度为byteChars长度的数组
                    const byteArrays = new Array(byteChars.length);
                    // 将二进制字符串转换为Uint8Array
                    for (let i = 0; i < byteChars.length; i++) {
                      byteArrays[i] = byteChars.charCodeAt(i);
                    }
                    // 返回一个Blob对象
                    return new Blob([new Uint8Array(byteArrays)], {type: 'image/png'});
                  }
                  node.src = URL.createObjectURL( base64ToBlob(res.data) )
                }
                arr.push(`<img src="${node.src}" />`);
              },
              A(){
                // 只保留href属性
                arr.push(`<a href="${node.href}">${node.innerText}</a>`);
              }
            }
            await action[node.tagName]?.();
            for (let i = 0; i < node.childNodes.length; i++) {
              await deepTr(node.childNodes[i]);
            }
          } else if (node.nodeType === 3) {
            // 排除非内容的文本节点
            const tagNameList = ['A','IMG','STYLE','SCRIPT'];
            if (!tagNameList.includes(node.parentNode.tagName)) {
              // 把node中的<、>、&转义
              node.nodeValue = node.nodeValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
              arr.push(node.nodeValue.trim());
              // 如果父节点是需要换行的标签，且当前节点是最后一个节点，则添加换行
              const tagNameList2 = ['P','DIV','FONT','H1','H2','H3','H4','H5','H6','LI','UL','OL','BR'];
              if (tagNameList2.includes(node.parentNode.tagName) && node.parentNode.lastChild === node) {
                arr.push('\n');
              }
            }else{
              // console.log('非内容文本节点', node.parentNode.tagName,node);
            }
          }else{
            // console.log('其他节点', node);
          }
        }
      }
      // #endif
    },
    methods: {
      oninput(e) {
        // #ifdef MP
        let oldValue = this.oninput.oldValue || '';
        // 当前输入框的值
        const value = e.detail.value 
        // 本次输入的数据
        const data = value.replace(oldValue, '') 
        this.oninput.oldValue = value
        e = {
          data,
          value
        }
        // #endif
        
				// #ifndef MP
				if ( typeof e.value === 'object' ){
					e.value.getHtmlArray = ()=>{
						const data = parseHtml(e.value.html)
						
						return {
							data,
							uploadImg: async htmlArray => await uploadHtmlArrayImgs(htmlArray || data)
						}
					}
				}
				// #endif
				
        this.$emit('input', e)
      },
			focus(){
				this.isFocus = false
				setTimeout(()=>{
					this.isFocus = true
				},0)
			},
			clickhandler(e){
				this.$emit('click',e)
			}
    }
  }
</script>
<!-- #ifndef MP -->
<script module="rdm" lang="renderjs">
  let lastFocusNode,lastCursor;
  // #ifdef APP
  function setSoftinputTemporary() {
      // console.log('setSoftinputTemporary')
      // 设置当前窗口键盘弹出后不做变化
      const currentWebview = plus.webview.currentWebview();
      currentWebview.setSoftinputTemporary({
        mode:'nothing',
        position:{top: 0,height: 0}
      });
  }
  // #endif
  export default {
    name: 'uni-im-editor',
    data() {
      return {
        uniImEditor: null,
      }
    },
    mounted() {
			// 拿到最后一个uni-im-editor的dom对象
			const uniImEditors = document.querySelectorAll('.uni-im-editor');
			this.uniImEditor = uniImEditors[uniImEditors.length - 1];
      this.uniImEditor.addEventListener('input', e => {
        setTimeout(()=>this.$oninput(e.data),0);
      });
      this.uniImEditor.addEventListener('click', e => {
        // console.log('click', e);
        // #ifdef APP
        setSoftinputTemporary()
        // #endif
        setTimeout(this.$refreshLastCursor, 0);
      });
      this.uniImEditor.addEventListener('blur', e => {
        // console.error('###blur', e);
      });
      // 键盘敲左右
      this.uniImEditor.addEventListener('keydown', e => {
        setTimeout(this.$refreshLastCursor, 0);
      });
	  
			// 自定义撤回操作
			class CustomHistory {
				constructor(that) {
					this.uniImEditor = that.uniImEditor
					this.maxHistory = 10;
					this.history = [];
					this.lock = false;
					this.uniImEditor.addEventListener('keydown', (event) => {
						if ( (event.ctrlKey || event.metaKey) && event.key === 'z') {
							// 拦截撤销操作
							// console.log('拦截撤销操作');
							event.preventDefault();
							// 撤销操作
							if (this.history.length > 0) {
								let last = this.history.pop();
								if (last === this.uniImEditor.innerHTML){
									last = this.history.pop();
								}
								// console.log('撤销操作',last);
								this.lock = true;
								that.$setContent(last ? {html: last} : '')
								this.lock = false;
							} else {
								// console.log('无历史记录');
								that.$setContent('')
							}
							// 设置光标在末尾
							that.$focus({toLast: true})
						}
					});
				}
				add(){
					if ( this.lock ){
						// return console.log('正在使用历史记录');
					}
					if (this.history.length >= this.maxHistory){
						this.history.shift();
					}
					this.history.push(this.uniImEditor.innerHTML);
					// console.log('this.history',this.history);
				}
			}
			this.customHistory = new CustomHistory(this);
      
      // 监听nickname后面的空格被删除（提醒此空格在margin-right: -3px;内，用于解决办法浏览器非文本节点后的光标定位不正确的问题）
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(mutation=> {
          // 判断是否为删除节点的操作
          const [removedNode] = mutation.removedNodes
          if(removedNode){
            if(removedNode && mutation?.previousSibling?.className === "nickname"){
              mutation.previousSibling.remove()
            }
          }
        });
      })
      .observe(this.uniImEditor, {
        childList: true, // 监听子节点的变化
      });
    },
    watch: {
      modelValue(modelValue, oldModelValue) {
        this.$nextTick(() => {
          // console.log('modelValue', modelValue);
          if (modelValue.length === 0) {
            this.uniImEditor.innerHTML = ''
          } else if (typeof modelValue === 'string' && modelValue != this.$inputText()) {
            this.uniImEditor.innerHTML = modelValue
          } else if (typeof modelValue === 'object' && modelValue.html != this.uniImEditor.innerHTML) {
            this.uniImEditor.innerHTML = modelValue.html
          }
        });
      },
    },
    methods: {
      // 刷新光标信息
      $refreshLastCursor() {
        lastCursor = this.$getCursor();
        lastFocusNode = window.getSelection().focusNode;
        // console.log('刷新光标信息',{
        //   lastCursor,
        //   lastFocusNode
        // });
      },
      $oninput(data){
        this.$refreshLastCursor()
        // 耗时计算
        let start = new Date().getTime();
        
        let param = '';
        let val = this.uniImEditor.innerHTML;
        
        const hasImg = this.uniImEditor.querySelector('img');
        const hasNickname = this.uniImEditor.querySelector('.nickname');
        const hasA = this.uniImEditor.querySelector('a');
        if (hasImg || hasNickname || hasA) {
          param = {
            "html": val,
            "text": this.uniImEditor.innerText,
            "aboutUserIds": Array.from(this.uniImEditor.querySelectorAll('.nickname')).map(i=>i.getAttribute('user_id'))
          }
        } else {
          param = this.$inputText()
        }
        
        // 打印耗时
        const spendTime = new Date().getTime() - start
        if(spendTime > 10){
          console.log('耗时', );
        }
        
        this.$ownerInstance.callMethod('oninput',{
          data,// 本次输入的数据
          value: param // 当前输入框的值
        })
      },
      $callMethod([funcName, ...params]) {
        // console.log('$callMethod funcName', funcName)
        // console.log('$callMethod funcName', funcName === null)
        // console.log('$callMethod params', params)
        // console.log('$callMethod typeof funcName', typeof funcName)
        try {
          if(typeof funcName == 'string'){
            const res = this[funcName](...params)
            // console.log('res', res)
          }
        } catch (e) {
          console.error("调用renderjs模块的方法失败", e,funcName,params)
        }
      },
      $getCursor() {
        const selection = window.getSelection();
        return selection.focusOffset;
      },
      // 恢复光标位置
      $restoreCursor(focus = true) {
        this.$focus();
        // 获取焦点时所在的子元素
        try{
          const range = document.createRange();
          const sel = window.getSelection(); 
          range.setStart(lastFocusNode || this.uniImEditor, lastCursor);
          range.collapse(true); 
          sel.removeAllRanges(); 
          sel.addRange(range);
        }catch(e){
          console.error('恢复光标位置失败',e)
          //TODO handle the exception
        }
      },
      $deleteLeftChar(n = 1) {
        this.$restoreCursor(true);
        const selection = window.getSelection();
        if (!selection.isCollapsed){
          console.error('不要删除已选中的内容')
          return;
        }
        const range = selection.getRangeAt(0).cloneRange();
        if (range.startOffset > 0) {
          range.setStart(range.startContainer, range.startOffset - n);
          range.deleteContents();
          selection.removeAllRanges();
          selection.addRange(range);
        } else if (range.startContainer.previousSibling) {
          const container = range.startContainer;
          const sibling = container.previousSibling;
          range.setStart(sibling, sibling.length - n);
          range.setEnd(sibling, sibling.length);
          range.deleteContents();
          selection.removeAllRanges();
          selection.addRange(range);
        }
        lastCursor = this.$getCursor();
        this.$oninput();
      },
      $addHtmlToCursor(html,focus = true) {
				this.customHistory.add();
        this.$restoreCursor(focus);
        const selection = window.getSelection();
        if (selection.getRangeAt && selection.rangeCount) {
          let range = selection.getRangeAt(0);
          range.deleteContents();
          var ele = document.createElement("div");
          ele.innerHTML = html;
          var frag = document.createDocumentFragment(),
            node, lastNode;
          while ((node = ele.firstChild)) {
            lastNode = frag.appendChild(node);
          }
          range.insertNode(frag);
          // 设置光标到插入内容之后的位置
          if (lastNode) {
            range = range.cloneRange();
            range.setStartAfter(lastNode);
            range.collapse(true);
            selection.removeAllRanges(); // 清除现有的选择区域
            selection.addRange(range); // 将更新后的范围添加回选择区域
          }
        }else{
          this.uniImEditor.innerHTML += html;
        }
        this.$oninput(html);
				// 记录历史
				this.customHistory.add();
      },
      $inputText() {
        return this.uniImEditor.innerText.trim();
      },
      $focus({toLast = false} = {}) {
        if(document.activeElement.className === 'uni-im-editor'){
          document.activeElement.blur();
        }
        // #ifdef APP
        setSoftinputTemporary()
        // #endif
        // console.error('获取焦点',document.activeElement.className);
        this.uniImEditor.focus();
        // console.error('获取焦点',document.activeElement.className);
				if(toLast){
					// 焦点定位到末尾
					const range = document.createRange();
					range.selectNodeContents(this.uniImEditor);
					range.collapse(false);
					const selection = window.getSelection();
					selection.removeAllRanges();
					selection.addRange(range);
				}
      },
      $blur(){
        // console.error('失去焦点1',document.activeElement.className);
        this.uniImEditor.blur();
        // console.error('失去焦点2',document.activeElement.className);
        setTimeout(()=>{
          // console.error('失去焦点3',document.activeElement.className);
        },1000)
      },
      $onBlur() {
        // this.$emit('update:focus', false);
        // console.log('blur');
        this.$emit('blur');
      },
      $onFocus() {
        // console.log('$onFocus');
        this.$emit('focus');
        // this.$emit('update:focus', true);
      },
      $setContent(data) {
        if (typeof data === 'string') {
          // 为兼容旧版- s &gt; 转换为 > $lt; 转换为 < &amp; 转换为 &
          data = data.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
          // 为兼容旧版- e
          this.uniImEditor.innerText = data;
          this.$oninput(data);
        } else if (typeof data === 'object') {
          this.uniImEditor.innerHTML = data.html || this.$arrDomJsonToHtml(data);
          this.$oninput(this.uniImEditor.innerHTML);
        }
      },
      $arrDomJsonToHtml(arr) {
        function parseItem(item) {
          if (item.type === "text") {
            return item.text;
          }
          let html = `<${item.name}`;
          if (item.attrs) {
            for (const key in item.attrs) {
              html += ` ${key}="${item.attrs[key]}"`;
            }
          }
          if (item.children) {
            html += ">";
            for (const child of item.children) {
              html += parseItem(child);
            }
            html += `</${item.name}>`;
          } else {
            html += " />";
          }
          return html;
        }

        let result = "";
        for (const item of arr) {
          result += parseItem(item);
        }
        return result;
      }
    }
  }
</script>
<!-- #endif -->

<style lang="scss">
.uni-im-editor-box {
  /* #ifdef MP */
  .uni-im-editor-mp {
    width: 100%;
    height: 26px;
    max-height: 110px;
  }
  /* #endif */
  
  /* #ifndef MP */
  .uni-im-editor {
    min-height: 26px;
    max-height: 110px;
    overflow: auto;
		white-space: pre-wrap;
    // 解决ios下不能编辑的问题
    user-select: text;
    -webkit-user-select:text;
    -webkit-user-modify: read-write-plaintext-only;
    /* #ifdef APP */
    &,* {
      user-select: text;
      -webkit-user-select:text;
      -webkit-user-modify: read-write-plaintext-only;
    }
    /* #endif */
    &:focus {
      outline: none;
    }
    & ::v-deep {
      img {
        max-width: 50%;
				height: auto;
        display: block;
      }
      .nickname {
         color: #0b65ff !important;
         user-select: text;
         margin-right: -3px;
         /* #ifdef H5 */
         cursor: pointer;
         /* #endif */
       }
    }
  }
  /* #endif */
}
</style>