"use strict";
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
const common_vendor = require("../../../../../common/vendor.js");
const uni_modules_uniIm_sdk_index = require("../../../sdk/index.js");
const _sfc_main = {
  props: {
    msg: {
      type: Object,
      default() {
        return {
          body: ""
        };
      }
    }
  },
  computed: {
    downloading() {
      return this.downloadProgress != 0 && this.downloadProgress != 100;
    },
    fileSize() {
      if (this.msg.type == "file") {
        let size = this.msg.body.size;
        if (size < Math.pow(1024, 1)) {
          return parseInt(size * 10) / 10 + "B";
        } else if (size < Math.pow(1024, 2)) {
          return parseInt(size / Math.pow(1024, 1) * 10) / 10 + "KB";
        } else if (size < Math.pow(1024, 3)) {
          return parseInt(size / Math.pow(1024, 2) * 10) / 10 + "MB";
        } else {
          return "err";
        }
      }
      return "err";
    },
    fileName() {
      if (this.msg.type == "file") {
        let name = this.msg.body.name;
        if (name.length < 30) {
          return name;
        } else {
          return name.slice(0, 15) + "..." + name.slice(-15);
        }
      }
      return "";
    }
  },
  data() {
    return {
      downloadProgress: 0
    };
  },
  methods: {
    downLoadFile() {
      return __async(this, null, function* () {
        const url = yield uni_modules_uniIm_sdk_index.uniIm.utils.getTempFileURL(this.msg.body.url);
        const downloadTask = common_vendor.index.downloadFile({
          url,
          success: (res) => {
            if (res.statusCode === 200) {
              common_vendor.index.saveFile({
                tempFilePath: res.tempFilePath,
                success: (res2) => {
                  common_vendor.index.openDocument({
                    filePath: res2.savedFilePath
                  });
                }
              });
            }
          }
        });
        downloadTask.onProgressUpdate((res) => {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-msg/types/file.vue:101", "下载进度" + res.progress);
          common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-msg/types/file.vue:102", "已经下载的数据长度" + res.totalBytesWritten);
          common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-msg/types/file.vue:103", "预期需要下载的数据总长度" + res.totalBytesExpectedToWrite);
          this.downloadProgress = parseInt(res.totalBytesWritten / this.msg.body.size * 100);
        });
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_im_icons2 = common_vendor.resolveComponent("uni-im-icons");
  _easycom_uni_im_icons2();
}
const _easycom_uni_im_icons = () => "../../uni-im-icons/uni-im-icons.js";
if (!Math) {
  _easycom_uni_im_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.downloading
  }, $options.downloading ? {
    b: common_vendor.t($data.downloadProgress)
  } : {}, {
    c: common_vendor.t($options.fileName),
    d: common_vendor.t($options.fileSize),
    e: $options.downloading ? 1 : "",
    f: common_vendor.p({
      code: "e7d0",
      size: "50",
      color: "#EEEEEE"
    }),
    g: common_vendor.o((...args) => $options.downLoadFile && $options.downLoadFile(...args))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg/types/file.js.map
