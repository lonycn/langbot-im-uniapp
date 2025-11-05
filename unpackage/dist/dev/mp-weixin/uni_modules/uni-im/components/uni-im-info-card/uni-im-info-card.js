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
const uni_modules_uniIm_sdk_index = require("../../sdk/index.js");
const common_vendor = require("../../../../common/vendor.js");
const common_assets = require("../../../../common/assets.js");
const _sfc_main = {
  emits: ["click"],
  props: {
    avatarUrl: {
      type: String,
      default: ""
    },
    avatarFile: {
      type: Object,
      default: () => {
      }
    },
    title: {
      type: String,
      default: ""
    },
    tags: {
      type: Array,
      default: () => []
    },
    time: {
      type: String,
      default: ""
    },
    note: {
      type: String,
      default: ""
    },
    badge: {
      type: [String, Number],
      default: 0
    },
    mute: {
      type: Boolean,
      default: false
    },
    pinned: {
      type: Boolean,
      default: false
    },
    redNote: {
      type: String,
      default: ""
    },
    link: {
      type: Boolean,
      default: false
    },
    is_star: {
      type: Boolean,
      default: false
    }
  },
  computed: {},
  data() {
    return {
      avatarFileUrl: "/uni_modules/uni-im/static/avatarUrl.png"
    };
  },
  watch: {
    avatarFile: {
      handler(avatarFile) {
        return __async(this, null, function* () {
          if (avatarFile == null ? void 0 : avatarFile.url) {
            this.avatarFileUrl = yield uni_modules_uniIm_sdk_index.uniIm.utils.getTempFileURL(avatarFile.url);
          }
        });
      },
      immediate: true,
      deep: true
    }
  },
  methods: {}
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.avatarUrl || $data.avatarFileUrl,
    b: common_vendor.t($props.title),
    c: common_vendor.f($props.tags, (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: tag
      };
    }),
    d: $props.time
  }, $props.time ? {
    e: common_vendor.t($props.time)
  } : {}, {
    f: common_vendor.t($props.redNote),
    g: common_vendor.t($props.note),
    h: $props.mute
  }, $props.mute ? {
    i: common_assets._imports_0
  } : {}, {
    j: $props.is_star
  }, $props.is_star ? {
    k: common_assets._imports_1
  } : {}, {
    l: $props.badge
  }, $props.badge ? common_vendor.e({
    m: $props.mute || $props.badge == "dot"
  }, $props.mute || $props.badge == "dot" ? {} : {
    n: common_vendor.t($props.badge > 99 ? "99+" : $props.badge)
  }) : {}, {
    o: $props.pinned
  }, $props.pinned ? {
    p: common_assets._imports_2
  } : {}, {
    q: $props.link ? 1 : "",
    r: common_vendor.o(($event) => _ctx.$emit("click"))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-info-card/uni-im-info-card.js.map
