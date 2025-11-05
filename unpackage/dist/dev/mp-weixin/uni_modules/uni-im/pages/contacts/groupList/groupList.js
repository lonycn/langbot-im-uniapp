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
  data() {
    return {
      keyword: "",
      groupData: false
    };
  },
  computed: {
    //是否为pc宽屏（width>960px）
    isWidescreen() {
      return uni_modules_uniIm_sdk_index.uniIm.isWidescreen;
    },
    groupList() {
      const groupList = uni_modules_uniIm_sdk_index.uniIm.group.dataList;
      if (this.keyword) {
        return groupList.filter((item) => {
          return item.name.includes(this.keyword) || item._id.includes(this.keyword);
        });
      } else {
        return groupList;
      }
    },
    groupHasMore() {
      return uni_modules_uniIm_sdk_index.uniIm.group.hasMore;
    }
  },
  mounted() {
    common_vendor.index.createIntersectionObserver(this, { observeAll: true }).relativeTo("body", {}).observe(".uni-im-load-state", (res) => {
      if (res.intersectionRatio > 0) {
        uni_modules_uniIm_sdk_index.uniIm.group.loadMore();
      }
    });
  },
  onLoad(options) {
    return __async(this, null, function* () {
      this.setParam(options);
    });
  },
  methods: {
    setParam(param = {}) {
      if (param.group_id) {
        this.keyword = param.group_id;
      }
    },
    doClear() {
      this.keyword = "";
    },
    toChat(group_id) {
      let conversation_id = "group_" + group_id;
      uni_modules_uniIm_sdk_index.uniIm.toChat({ conversation_id });
    }
  }
};
if (!Array) {
  const _easycom_uni_search_bar2 = common_vendor.resolveComponent("uni-search-bar");
  const _easycom_uni_im_info_card2 = common_vendor.resolveComponent("uni-im-info-card");
  const _easycom_uni_im_load_state2 = common_vendor.resolveComponent("uni-im-load-state");
  (_easycom_uni_search_bar2 + _easycom_uni_im_info_card2 + _easycom_uni_im_load_state2)();
}
const _easycom_uni_search_bar = () => "../../../../uni-search-bar/components/uni-search-bar/uni-search-bar.js";
const _easycom_uni_im_info_card = () => "../../../components/uni-im-info-card/uni-im-info-card.js";
const _easycom_uni_im_load_state = () => "../../../components/uni-im-load-state/uni-im-load-state.js";
if (!Math) {
  (_easycom_uni_search_bar + _easycom_uni_im_info_card + _easycom_uni_im_load_state)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o($options.doClear),
    b: common_vendor.o($options.doClear),
    c: common_vendor.o(($event) => $data.keyword = $event),
    d: common_vendor.p({
      placeholder: "搜索群号/群名称",
      radius: 100,
      bgColor: "#eeeeee",
      modelValue: $data.keyword
    }),
    e: common_vendor.f($options.groupList, (item, index, i0) => {
      var _a;
      return {
        a: index,
        b: common_vendor.o(($event) => $options.toChat(item._id), index),
        c: "916078d4-1-" + i0,
        d: common_vendor.p({
          link: true,
          title: item == null ? void 0 : item.name,
          avatar: ((_a = item == null ? void 0 : item.avatar_file) == null ? void 0 : _a.url) || "/uni_modules/uni-im/static/avatarUrl.png"
        })
      };
    }),
    f: common_vendor.p({
      status: $options.groupHasMore ? "loading" : "noMore"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/pages/contacts/groupList/groupList.js.map
