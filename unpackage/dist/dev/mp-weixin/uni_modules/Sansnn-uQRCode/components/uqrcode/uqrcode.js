"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_SansnnUQRCode_js_sdk_uqrcode_uqrcode = require("../../js_sdk/uqrcode/uqrcode.js");
const uni_modules_SansnnUQRCode_common_queue = require("../../common/queue.js");
const uni_modules_SansnnUQRCode_common_cache = require("../../common/cache.js");
let instance = null;
const _sfc_main = {
  name: "uqrcode",
  props: {
    /**
     * canvas组件id
     */
    canvasId: {
      type: String,
      required: true
      // canvasId在微信小程序初始值不能为空，created中赋值也不行，必须给一个值，否则挂载组件后无法绘制。不考虑用随机id，uuid
    },
    /**
     * 二维码内容
     */
    value: {
      type: [String, Number]
    },
    /**
     * 选项
     */
    options: {
      type: Object,
      default: () => {
        return {};
      }
    },
    /**
     * 二维码大小
     */
    size: {
      type: [String, Number],
      default: 200
    },
    /**
     * 二维码尺寸单位
     */
    sizeUnit: {
      type: String,
      default: "px"
    },
    /**
     * 导出的文件类型
     */
    fileType: {
      type: String,
      default: "png"
    },
    /**
     * 是否初始化组件后就开始生成
     */
    start: {
      type: Boolean,
      default: true
    },
    /**
     * 是否数据发生改变自动重绘
     */
    auto: {
      type: Boolean,
      default: true
    },
    /**
     * 隐藏组件
     */
    hide: {
      type: Boolean,
      default: false
    },
    /**
     * canvas 类型，微信小程序默认使用2d，非2d微信官方已放弃维护，问题比较多
     * 注意：微信小程序type2d手机上正常，PC上微信内打开小程序toDataURL报错，看后期微信官方团队会不会做兼容，不兼容的话只能在自行判断在PC使用非2d，或者直接提示用户请在手机上操作，微信团队的海报中心小程序就是这么做的
     */
    type: {
      type: String,
      default: () => {
        return "2d";
      }
    },
    /**
     * 队列绘制，主要针对NVue端
     */
    queue: {
      type: Boolean,
      default: false
    },
    /**
     * 是否队列加载图片，可减少canvas发起的网络资源请求，节省服务器资源
     */
    isQueueLoadImage: {
      type: Boolean,
      default: false
    },
    /**
     * loading态
     */
    loading: {
      type: Boolean,
      default: void 0
    },
    /**
     * H5保存即自动下载（在支持的环境下），默认false为仅弹层提示用户需要长按图片保存，不会自动下载
     */
    h5SaveIsDownload: {
      type: Boolean,
      default: false
    },
    /**
     * H5下载名称
     */
    h5DownloadName: {
      type: String,
      default: "uQRCode"
    }
  },
  data() {
    return {
      canvas: void 0,
      canvasType: void 0,
      canvasContext: void 0,
      makeDelegate: void 0,
      drawDelegate: void 0,
      toTempFilePathDelegate: void 0,
      makeExecuted: false,
      makeing: false,
      drawing: false,
      isError: false,
      error: void 0,
      isH5Save: false,
      tempFilePath: "",
      templateOptions: {
        size: 0,
        width: 0,
        // 组件宽度
        height: 0,
        canvasWidth: 0,
        // canvas宽度
        canvasHeight: 0,
        canvasTransform: "",
        canvasDisplay: false
      },
      uqrcodeOptions: {
        data: ""
      },
      plugins: [],
      makeingPattern: [
        [
          [true, true, true, false, false, false, false, true, true, true],
          [true, true, true, false, false, false, false, true, true, true],
          [true, true, true, false, false, false, false, true, true, true],
          [true, true, true, false, false, false, false, true, true, true],
          [true, true, true, false, false, false, false, true, true, true],
          [true, true, true, false, false, false, false, true, true, true],
          [true, true, true, false, false, false, false, true, true, true],
          [true, true, true, true, true, true, true, true, true, true],
          [true, true, true, true, true, true, true, true, true, true],
          [true, true, true, true, true, true, true, true, true, true]
        ],
        [
          [true, true, true, true, true, true, true, true, true, true],
          [true, true, true, true, true, true, true, true, true, true],
          [true, true, true, true, true, true, true, true, true, true],
          [true, true, true, false, false, false, false, true, true, true],
          [true, true, true, false, false, false, false, true, true, true],
          [true, true, true, false, false, false, false, true, true, true],
          [true, true, true, false, false, false, false, false, false, false],
          [true, true, true, true, true, true, false, true, true, true],
          [true, true, true, true, true, true, false, true, true, true],
          [true, true, true, true, true, true, false, true, true, true]
        ],
        [
          [true, true, true, true, true, true, true, true, true, true],
          [true, true, true, true, true, true, true, true, true, true],
          [true, true, true, true, true, true, true, true, true, true],
          [true, true, true, false, false, false, false, true, true, true],
          [true, true, true, false, false, false, false, true, true, true],
          [true, true, true, true, true, true, true, false, false, false],
          [true, true, true, true, true, true, true, false, false, false],
          [true, true, true, true, true, true, true, false, false, false],
          [true, true, true, false, false, false, false, true, true, true],
          [true, true, true, false, false, false, false, true, true, true]
        ],
        [
          [true, true, true, true, true, true, true, true, true, true],
          [true, true, true, true, true, true, true, true, true, true],
          [true, true, true, true, true, true, true, true, true, true],
          [true, true, true, false, false, false, false, false, false, false],
          [true, true, true, false, false, false, false, false, false, false],
          [true, true, true, false, false, false, false, false, false, false],
          [true, true, true, false, false, false, false, false, false, false],
          [true, true, true, true, true, true, true, true, true, true],
          [true, true, true, true, true, true, true, true, true, true],
          [true, true, true, true, true, true, true, true, true, true]
        ]
      ]
    };
  },
  watch: {
    type: {
      handler(val) {
        const types = ["2d"];
        if (types.includes(val)) {
          this.canvasType = val;
        } else {
          this.canvasType = void 0;
        }
      },
      immediate: true
    },
    value: {
      handler() {
        if (this.auto) {
          this.remake();
        }
      }
    },
    size: {
      handler() {
        if (this.auto) {
          this.remake();
        }
      }
    },
    options: {
      handler() {
        if (this.auto) {
          this.remake();
        }
      },
      deep: true
    },
    makeing: {
      handler(val) {
        if (!val) {
          if (typeof this.toTempFilePathDelegate === "function") {
            this.toTempFilePathDelegate();
          }
        }
      }
    }
  },
  mounted() {
    this.templateOptions.size = this.sizeUnit == "rpx" ? common_vendor.index.upx2px(this.size) : this.size;
    this.templateOptions.width = this.templateOptions.size;
    this.templateOptions.height = this.templateOptions.size;
    this.templateOptions.canvasWidth = this.templateOptions.size;
    this.templateOptions.canvasHeight = this.templateOptions.size;
    if (this.canvasType == "2d")
      ;
    else {
      this.templateOptions.canvasTransform = `scale(${this.templateOptions.size / this.templateOptions.canvasWidth}, ${this.templateOptions.size / this.templateOptions.canvasHeight})`;
    }
    if (this.start) {
      this.make();
    }
  },
  methods: {
    /**
     * 获取模板选项
     */
    getTemplateOptions() {
      var size = this.sizeUnit == "rpx" ? common_vendor.index.upx2px(this.size) : this.size;
      return deepReplace(this.templateOptions, {
        size,
        width: size,
        height: size
      });
    },
    /**
     * 获取插件选项
     */
    getUqrcodeOptions() {
      return deepReplace(this.options, {
        data: String(this.value),
        size: Number(this.templateOptions.size)
      });
    },
    /**
     * 重置画布
     */
    resetCanvas(callback) {
      this.templateOptions.canvasDisplay = false;
      this.$nextTick(() => {
        this.templateOptions.canvasDisplay = true;
        this.$nextTick(() => {
          callback && callback();
        });
      });
    },
    /**
     * 绘制二维码
     */
    draw() {
      return __async(this, arguments, function* (callback = {}, isDrawDelegate = false) {
        if (typeof callback.success != "function") {
          callback.success = () => {
          };
        }
        if (typeof callback.fail != "function") {
          callback.fail = () => {
          };
        }
        if (typeof callback.complete != "function") {
          callback.complete = () => {
          };
        }
        if (this.drawing) {
          if (!isDrawDelegate) {
            this.drawDelegate = () => {
              this.draw(callback, true);
            };
            return;
          }
        } else {
          this.drawing = true;
        }
        if (!this.canvasId) {
          common_vendor.index.__f__("error", "at uni_modules/Sansnn-uQRCode/components/uqrcode/uqrcode.vue:405", "[uQRCode]: canvasId must be set!");
          this.isError = true;
          this.drawing = false;
          callback.fail({
            errMsg: "[uQRCode]: canvasId must be set!"
          });
          callback.complete({
            errMsg: "[uQRCode]: canvasId must be set!"
          });
          return;
        }
        if (!this.value) {
          common_vendor.index.__f__("error", "at uni_modules/Sansnn-uQRCode/components/uqrcode/uqrcode.vue:417", "[uQRCode]: value must be set!");
          this.isError = true;
          this.drawing = false;
          callback.fail({
            errMsg: "[uQRCode]: value must be set!"
          });
          callback.complete({
            errMsg: "[uQRCode]: value must be set!"
          });
          return;
        }
        this.templateOptions = this.getTemplateOptions();
        this.uqrcodeOptions = this.getUqrcodeOptions();
        if (typeof this.uqrcodeOptions.errorCorrectLevel === "string") {
          this.uqrcodeOptions.errorCorrectLevel = uni_modules_SansnnUQRCode_js_sdk_uqrcode_uqrcode.b.errorCorrectLevel[this.uqrcodeOptions.errorCorrectLevel];
        }
        if (typeof this.options.useDynamicSize === "undefined") {
          this.uqrcodeOptions.useDynamicSize = true;
        }
        const qr = instance = new uni_modules_SansnnUQRCode_js_sdk_uqrcode_uqrcode.b();
        this.plugins.forEach((p) => qr.register(p.plugin));
        qr.setOptions(this.uqrcodeOptions);
        qr.make();
        let canvasContext = null;
        if (this.canvasType === "2d") {
          const canvas = this.canvas = yield new Promise((resolve) => {
            common_vendor.index.createSelectorQuery().in(this).select(`#${this.canvasId}`).fields({
              node: true,
              size: true
            }).exec((res) => {
              resolve(res[0].node);
            });
          });
          canvasContext = this.canvasContext = canvas.getContext("2d");
          this.templateOptions.canvasWidth = qr.size;
          this.templateOptions.canvasHeight = qr.size;
          this.templateOptions.canvasTransform = "";
          const dpr = common_vendor.index.getSystemInfoSync().pixelRatio;
          canvas.width = qr.dynamicSize * dpr;
          canvas.height = qr.dynamicSize * dpr;
          canvasContext.scale(dpr, dpr);
          qr.loadImage = this.getLoadImage(function(src) {
            return new Promise((resolve, reject) => {
              const img = canvas.createImage();
              img.src = src;
              img.onload = () => {
                resolve(img);
              };
              img.onerror = (err) => {
                reject(err);
              };
            });
          });
        } else {
          canvasContext = this.canvasContext = common_vendor.index.createCanvasContext(this.canvasId, this);
          this.templateOptions.canvasWidth = qr.dynamicSize;
          this.templateOptions.canvasHeight = qr.dynamicSize;
          this.templateOptions.canvasTransform = `scale(${this.templateOptions.size / this.templateOptions.canvasWidth}, ${this.templateOptions.size / this.templateOptions.canvasHeight})`;
          qr.loadImage = this.getLoadImage(function(src) {
            return new Promise((resolve, reject) => {
              if (src.startsWith("http")) {
                common_vendor.index.getImageInfo({
                  src,
                  success: (res) => {
                    resolve(res.path);
                  },
                  fail: (err) => {
                    reject(err);
                  }
                });
              } else {
                if (src.startsWith(".")) {
                  common_vendor.index.__f__("error", "at uni_modules/Sansnn-uQRCode/components/uqrcode/uqrcode.vue:561", "[uQRCode]: 本地图片路径仅支持绝对路径！");
                  throw new Error("[uQRCode]: local image path only supports absolute path!");
                } else {
                  resolve(src);
                }
              }
            });
          });
        }
        qr.canvasContext = canvasContext;
        setTimeout(() => {
          var plugin = this.plugins.find((p) => p.name == qr.style);
          var drawCanvasName = plugin ? plugin.drawCanvas : "drawCanvas";
          var drawCanvas;
          if (this.queue) {
            drawCanvas = () => uni_modules_SansnnUQRCode_common_queue.queueDraw.exec(() => qr[drawCanvasName]());
          } else {
            drawCanvas = () => qr[drawCanvasName]();
          }
          drawCanvas().then(() => {
            if (this.drawDelegate) {
              let delegate = this.drawDelegate;
              this.drawDelegate = void 0;
              delegate();
            } else {
              this.drawing = false;
              callback.success();
            }
          }).catch((err) => {
            common_vendor.index.__f__("log", "at uni_modules/Sansnn-uQRCode/components/uqrcode/uqrcode.vue:633", err);
            if (this.drawDelegate) {
              let delegate = this.drawDelegate;
              this.drawDelegate = void 0;
              delegate();
            } else {
              this.drawing = false;
              this.isError = true;
              callback.fail(err);
            }
          }).finally(() => {
            callback.complete();
          });
        }, 300);
      });
    },
    /**
     * 生成二维码
     */
    make(callback = {}) {
      this.makeExecuted = true;
      this.makeing = true;
      this.isError = false;
      if (typeof callback.success != "function") {
        callback.success = () => {
        };
      }
      if (typeof callback.fail != "function") {
        callback.fail = () => {
        };
      }
      if (typeof callback.complete != "function") {
        callback.complete = () => {
        };
      }
      this.resetCanvas(() => {
        clearTimeout(this.makeDelegate);
        this.makeDelegate = setTimeout(() => {
          this.draw({
            success: () => {
              setTimeout(() => {
                callback.success();
                this.complete(true);
              }, 300);
            },
            fail: (err) => {
              callback.fail(err);
              this.error = err;
              this.complete(false, err.errMsg);
            },
            complete: () => {
              callback.complete();
              this.makeing = false;
            }
          });
        }, 300);
      });
    },
    /**
     * 重新生成
     */
    remake(callback) {
      this.$emit("change");
      this.make(callback);
    },
    /**
     * 生成完成
     */
    complete(success = true, errMsg = "") {
      if (success) {
        this.$emit("complete", {
          success
        });
      } else {
        this.$emit("complete", {
          success,
          errMsg
        });
      }
    },
    /**
     * 导出临时路径
     */
    toTempFilePath(callback = {}) {
      if (typeof callback.success != "function") {
        callback.success = () => {
        };
      }
      if (typeof callback.fail != "function") {
        callback.fail = () => {
        };
      }
      if (typeof callback.complete != "function") {
        callback.complete = () => {
        };
      }
      if (!this.makeExecuted) {
        common_vendor.index.__f__("error", "at uni_modules/Sansnn-uQRCode/components/uqrcode/uqrcode.vue:728", "[uQRCode]: make() 方法从未调用！请先成功调用 make() 后再进行操作。");
        var err = {
          errMsg: "[uQRCode]: make() method has never been executed! please execute make() successfully before operating."
        };
        callback.fail(err);
        callback.complete(err);
        return;
      }
      if (this.isError) {
        callback.fail(this.error);
        callback.complete(this.error);
        return;
      }
      if (this.makeing) {
        this.toTempFilePathDelegate = () => {
          this.toTempFilePath(callback);
        };
        return;
      } else {
        this.toTempFilePathDelegate = null;
      }
      if (this.canvasType === "2d") {
        try {
          let dataURL = null;
          dataURL = common_vendor.toRaw(this.canvas).toDataURL();
          callback.success({
            tempFilePath: dataURL
          });
          callback.complete({
            tempFilePath: dataURL
          });
        } catch (e) {
          callback.fail(e);
          callback.complete(e);
        }
      } else {
        common_vendor.index.canvasToTempFilePath(
          {
            canvasId: this.canvasId,
            fileType: this.fileType,
            width: Number(this.templateOptions.canvasWidth),
            height: Number(this.templateOptions.canvasHeight),
            destWidth: Number(this.templateOptions.size),
            destHeight: Number(this.templateOptions.size),
            success: (res) => {
              callback.success(res);
            },
            fail: (err2) => {
              callback.fail(err2);
            },
            complete: () => {
              callback.complete();
            }
          },
          this
        );
      }
    },
    /**
     * 保存
     */
    save(callback = {}) {
      if (typeof callback.success != "function") {
        callback.success = () => {
        };
      }
      if (typeof callback.fail != "function") {
        callback.fail = () => {
        };
      }
      if (typeof callback.complete != "function") {
        callback.complete = () => {
        };
      }
      this.toTempFilePath({
        success: (res) => {
          if (this.canvasType === "2d") {
            const reg = new RegExp("^data:image/png;base64,", "g");
            const dataURL = res.tempFilePath.replace(reg, "");
            const fs = common_vendor.wx$1.getFileSystemManager();
            const tempFilePath = `${common_vendor.wx$1.env.USER_DATA_PATH}/${(/* @__PURE__ */ new Date()).getTime()}${Math.random().toString().split(".")[1]}.png`;
            fs.writeFile({
              filePath: tempFilePath,
              // 要写入的文件路径 (本地路径)
              data: dataURL,
              // base64图片
              encoding: "base64",
              success: (res1) => {
                common_vendor.index.saveImageToPhotosAlbum({
                  filePath: tempFilePath,
                  success: (res2) => {
                    callback.success(res2);
                  },
                  fail: (err2) => {
                    callback.fail(err2);
                  },
                  complete: () => {
                    callback.complete();
                  }
                });
              },
              fail: (err) => {
                callback.fail(err);
              },
              complete: () => {
                callback.complete();
              }
            });
          } else {
            common_vendor.index.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: (res1) => {
                callback.success(res1);
              },
              fail: (err1) => {
                callback.fail(err1);
              },
              complete: () => {
                callback.complete();
              }
            });
          }
        },
        fail: (err) => {
          callback.fail(err);
          callback.complete(err);
        }
      });
    },
    /**
     * 注册click事件
     */
    onClick(e) {
      this.$emit("click", e);
    },
    /**
     * 获取实例
     */
    getInstance() {
      return instance;
    },
    /**
     * 注册扩展，组件仅支持注册type为style的drawCanvas扩展
     * @param {Object} plugin
     */
    registerStyle(plugin) {
      if (plugin.Type != "style") {
        common_vendor.index.__f__("warn", "at uni_modules/Sansnn-uQRCode/components/uqrcode/uqrcode.vue:930", "[uQRCode]: registerStyle 仅支持注册 style 类型的扩展！");
        return {
          errMsg: "registerStyle 仅支持注册 style 类型的扩展！"
        };
      }
      if (typeof plugin === "function") {
        this.plugins.push({
          plugin,
          name: plugin.Name,
          drawCanvas: plugin.DrawCanvas
        });
      }
    },
    getLoadImage(loadImage) {
      var that = this;
      if (typeof loadImage == "function") {
        return function(src) {
          if (that.isQueueLoadImage) {
            return uni_modules_SansnnUQRCode_common_queue.queueLoadImage.exec(() => {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  const cache = uni_modules_SansnnUQRCode_common_cache.cacheImageList.find((x) => x.src == src);
                  if (cache) {
                    resolve(cache.img);
                  } else {
                    loadImage(src).then((img) => {
                      uni_modules_SansnnUQRCode_common_cache.cacheImageList.push({
                        src,
                        img
                      });
                      resolve(img);
                    }).catch((err) => {
                      reject(err);
                    });
                  }
                }, 10);
              });
            });
          } else {
            return loadImage(src);
          }
        };
      } else {
        return function(src) {
          return Promise.resolve(src);
        };
      }
    }
  }
};
function deepReplace(o = {}, r = {}, c = false) {
  let obj;
  if (c) {
    obj = o;
  } else {
    obj = __spreadValues({}, o);
  }
  for (let k in r) {
    var vr = r[k];
    if (vr != void 0) {
      if (vr.constructor == Object) {
        obj[k] = this.deepReplace(obj[k], vr);
      } else if (vr.constructor == String && !vr) {
        obj[k] = obj[k];
      } else {
        obj[k] = vr;
      }
    }
  }
  return obj;
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.templateOptions.canvasDisplay
  }, $data.templateOptions.canvasDisplay ? {
    b: $props.canvasId,
    c: $props.canvasId,
    d: $data.canvasType,
    e: `${$data.templateOptions.canvasWidth}px`,
    f: `${$data.templateOptions.canvasHeight}px`,
    g: $data.templateOptions.canvasTransform,
    h: common_vendor.o((...args) => $options.onClick && $options.onClick(...args))
  } : {}, {
    i: $props.loading === void 0 ? $data.makeing : $props.loading
  }, ($props.loading === void 0 ? $data.makeing : $props.loading) ? {
    j: `${$data.templateOptions.size / 4}px`,
    k: `${$data.templateOptions.size / 4}px`
  } : {}, {
    l: $data.isError
  }, $data.isError ? {
    m: common_vendor.t($data.error.errMsg),
    n: common_vendor.r("error", {
      error: $data.error
    }),
    o: common_vendor.o((...args) => $options.onClick && $options.onClick(...args))
  } : {}, {
    p: $props.hide ? 1 : "",
    q: `${$data.templateOptions.width}px`,
    r: `${$data.templateOptions.height}px`
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-42fcb7aa"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/Sansnn-uQRCode/components/uqrcode/uqrcode.js.map
