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
const common_vendor = require("../../../../common/vendor.js");
const uni_modules_uniIm_sdk_index = require("../../sdk/index.js");
const _sfc_main = {
  onLoad() {
  },
  computed: {
    //是否为pc宽屏（width>960px）
    isWidescreen() {
      return uni_modules_uniIm_sdk_index.uniIm.isWidescreen;
    }
  },
  data() {
    return {
      loadMoreStatus: "more",
      udbWhere: ""
      //'_id != $cloudEnv_uid',
    };
  },
  onPullDownRefresh() {
    this.$refs.udb.loadData(
      {
        clear: true
      },
      () => {
        common_vendor.index.stopPullDownRefresh();
      }
    );
  },
  onReachBottom() {
    this.$refs.udb.loadMore();
  },
  onNavigationBarButtonTap(e) {
    common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/userList/userList.vue:48", e);
    if (e.index) {
      let data = common_vendor.index.getStorageInfoSync();
      common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/userList/userList.vue:51", "data.keys", JSON.stringify(data.keys));
      data.keys.forEach((item) => {
        if (item.includes("uni-im-msg:") || item.includes("uni-im-conversation")) {
          common_vendor.index.removeStorageSync(item);
          common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/userList/userList.vue:56", common_vendor.index.getStorageSync(item));
        }
      });
      common_vendor.index.showToast({
        title: "clear storage ok",
        icon: "none"
      });
    } else {
      common_vendor.index.navigateTo({
        url: "/uni_modules/uni-id-pages/pages/login/login-withpwd",
        complete: (e2) => {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/userList/userList.vue:67", e2);
        }
      });
    }
  },
  methods: {
    handleLoad(data, ended) {
      this.loadMoreStatus = ended ? "noMore" : "more";
    },
    toChat(user_id) {
      return __async(this, null, function* () {
        if (this.isWidescreen) {
          location.href = "/#/uni_modules/uni-im/pages/index/index?user_id=" + user_id;
        } else {
          common_vendor.index.navigateTo({
            url: "/uni_modules/uni-im/pages/chat/chat?user_id=" + user_id
          });
        }
      });
    },
    toAdd() {
      common_vendor.index.navigateTo({
        url: "../uni-id-users/add",
        events: {
          // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
          refreshData: () => {
            this.$refs.udb.loadData({
              clear: true
            });
          }
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_im_info_card2 = common_vendor.resolveComponent("uni-im-info-card");
  const _easycom_uni_list2 = common_vendor.resolveComponent("uni-list");
  const _easycom_uni_im_load_state2 = common_vendor.resolveComponent("uni-im-load-state");
  const _easycom_unicloud_db2 = common_vendor.resolveComponent("unicloud-db");
  (_easycom_uni_im_info_card2 + _easycom_uni_list2 + _easycom_uni_im_load_state2 + _easycom_unicloud_db2)();
}
const _easycom_uni_im_info_card = () => "../../components/uni-im-info-card/uni-im-info-card.js";
const _easycom_uni_list = () => "../../../uni-list/components/uni-list/uni-list.js";
const _easycom_uni_im_load_state = () => "../../components/uni-im-load-state/uni-im-load-state.js";
const _easycom_unicloud_db = () => "../../../../node-modules/@dcloudio/uni-components/lib/unicloud-db/unicloud-db.js";
if (!Math) {
  (_easycom_uni_im_info_card + _easycom_uni_list + _easycom_uni_im_load_state + _easycom_unicloud_db)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.w(({
      data,
      loading,
      pagination,
      error,
      options
    }, s0, i0) => {
      return common_vendor.e({
        a: error
      }, error ? {
        b: common_vendor.t(error.message)
      } : {
        c: common_vendor.f(data, (item, index, i1) => {
          var _a;
          return {
            a: item._id,
            b: common_vendor.o(($event) => $options.toChat(item._id), item._id),
            c: "04af6178-2-" + i0 + "-" + i1 + "," + ("04af6178-1-" + i0),
            d: common_vendor.p({
              link: true,
              title: item.nickname,
              avatar: ((_a = item.avatar_file) == null ? void 0 : _a.url) || "/uni_modules/uni-im/static/avatarUrl.png"
            })
          };
        }),
        d: "04af6178-1-" + i0 + ",04af6178-0",
        e: common_vendor.p({
          border: false
        })
      }, {
        f: "04af6178-3-" + i0 + ",04af6178-0",
        g: common_vendor.p({
          status: loading ? "loading" : $data.loadMoreStatus
        }),
        h: i0,
        i: s0
      });
    }, {
      name: "d",
      path: "a",
      vueId: "04af6178-0"
    }),
    b: common_vendor.sr("udb", "04af6178-0"),
    c: common_vendor.o($options.handleLoad),
    d: common_vendor.p({
      collection: "uni-id-users",
      field: "_id,nickname,avatar_file",
      where: $data.udbWhere
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/pages/userList/userList.js.map
