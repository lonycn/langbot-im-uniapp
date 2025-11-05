export default callback => {
  // 记录socket 重连次数
  let socketOpenIndex = 0
  uni.onSocketOpen(()=>{
    console.log('WebSocket 连接已打开！');
    // 记录socket连接次数
    socketOpenIndex++
    callback(true,socketOpenIndex)
  });
  uni.onSocketClose(()=>{
    console.log('WebSocket 已关闭！');
    callback(false,socketOpenIndex)
  });
}