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
      default: () => {
        return {};
      }
    }
  },
  computed: {
    orderInfo() {
      return this.msg.body;
    },
    nickName() {
      var _a;
      return ((_a = uni_modules_uniIm_sdk_index.uniIm.users.find(this.orderInfo.user_id)[0]) == null ? void 0 : _a.nickname) || "未知";
    },
    isExpired() {
      let now = Date.now() + uni_modules_uniIm_sdk_index.uniIm.heartbeat * 0;
      return now > this.orderInfo.expire_time;
    },
    // 对公打款，是否过期
    isExpired2() {
      let now = Date.now() + uni_modules_uniIm_sdk_index.uniIm.heartbeat * 0;
      return now > this.msg.create_time + 3600 * 24 * 7 * 1e3;
    },
    isMineOrder() {
      return this.orderInfo.user_id == uni_modules_uniIm_sdk_index.uniIm.currentUser._id;
    },
    status() {
      if (this.orderInfo.status == 1) {
        return "已支付";
      }
      if (this.isExpired && this.isExpired2) {
        return "已过期";
      }
      if (this.orderInfo.status == 0) {
        return "待支付";
      }
      return "待支付";
    }
  },
  data() {
    return {};
  },
  methods: {
    toPay() {
      return __async(this, null, function* () {
        const uniIdSpaceConfig = {
          provider: "private",
          spaceName: "uni-id-server",
          spaceId: "uni-id-server",
          clientSecret: "ba461799-fde8-429f-8cc4-4b6d306e2339",
          endpoint: "https://account.dcloud.net.cn"
        };
        const uniIdCenterEnv = common_vendor.tr.init(uniIdSpaceConfig);
        const uniIdCenterObj = uniIdCenterEnv.importObject("uni-id-co");
        let oauthToken;
        try {
          let res = yield uniIdCenterObj.getOauthToken();
          common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-msg/types/order.vue:109", "getOauthToken", res);
          oauthToken = res.data.access_token;
        } catch (e) {
          return common_vendor.index.showModal({
            content: JSON.stringify(e),
            showCancel: false
          });
        }
        const url = `https://dev.dcloud.net.cn/pages/common/pay?return_url=` + encodeURIComponent("/uni_modules/uni-trade/pages/order-payment/order-payment?order_id=" + this.orderInfo.order_id) + "&oauthToken=" + oauthToken;
        common_vendor.index.__f__("log", "at uni_modules/uni-im/components/uni-im-msg/types/order.vue:121", "url", url);
        uni_modules_uniIm_sdk_index.uniIm.utils.openURL(url);
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($options.orderInfo.order_id),
    b: common_vendor.t($options.orderInfo.product.name),
    c: common_vendor.t($options.orderInfo.product.price),
    d: common_vendor.t($options.nickName),
    e: common_vendor.t($options.status),
    f: $options.orderInfo.status === 1
  }, $options.orderInfo.status === 1 ? {
    g: common_vendor.t(new Date($options.orderInfo.pay_time).toLocaleString()),
    h: common_vendor.t($options.orderInfo.pay_channel)
  } : $options.isMineOrder && (!$options.isExpired || !$options.isExpired2) ? {
    j: common_vendor.o((...args) => $options.toPay && $options.toPay(...args)),
    k: $options.isExpired,
    l: common_vendor.t(new Date($options.orderInfo.expire_time).toLocaleString()),
    m: common_vendor.o((...args) => $options.toPay && $options.toPay(...args)),
    n: $options.isExpired2,
    o: common_vendor.t(new Date($props.msg.create_time + 3600 * 24 * 7 * 1e3).toLocaleString())
  } : {}, {
    i: $options.isMineOrder && (!$options.isExpired || !$options.isExpired2)
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/components/uni-im-msg/types/order.js.map
