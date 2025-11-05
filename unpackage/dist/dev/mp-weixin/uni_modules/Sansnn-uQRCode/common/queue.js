"use strict";
function Queue() {
  let waitingQueue = this.waitingQueue = [];
  let isRunning = this.isRunning = false;
  function execute(task, resolve, reject) {
    task().then((data) => {
      resolve(data);
    }).catch((e) => {
      reject(e);
    }).finally(() => {
      if (waitingQueue.length) {
        const next = waitingQueue.shift();
        execute(next.task, next.resolve, next.reject);
      } else {
        isRunning = false;
      }
    });
  }
  this.exec = function(task) {
    return new Promise((resolve, reject) => {
      if (isRunning) {
        waitingQueue.push({
          task,
          resolve,
          reject
        });
      } else {
        isRunning = true;
        execute(task, resolve, reject);
      }
    });
  };
}
const queueDraw = new Queue();
const queueLoadImage = new Queue();
exports.queueDraw = queueDraw;
exports.queueLoadImage = queueLoadImage;
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/uni_modules/Sansnn-uQRCode/common/queue.js.map
