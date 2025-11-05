"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
const msgRichText = () => "../../../components/uni-im-msg/types/rich-text.js";
const noticeEdit = () => "./edit2.js";
const _sfc_main = {
  emits: ["close"],
  computed: __spreadValues({}, uni_modules_uniIm_sdk_index.uniIm.mapState(["isWidescreen"])),
  components: {
    msgRichText,
    noticeEdit
  },
  data() {
    return {
      where: {},
      isAdmin: false
    };
  },
  onLoad(param) {
    this.$nextTick(() => {
      this.load(param);
    });
  },
  methods: {
    remove(item) {
      return __async(this, null, function* () {
        common_vendor.index.showModal({
          content: "确认删除该公告？",
          success: (res) => __async(this, null, function* () {
            if (res.confirm) {
              common_vendor.index.showLoading({
                mask: true
              });
              const { _id, group_id } = item;
              const dbJQL = common_vendor.tr.databaseForJQL();
              yield dbJQL.collection("uni-im-group-notice").where({ _id, group_id }).remove().then((res2) => {
                this.$refs.udb.dataList = this.$refs.udb.dataList.filter((it) => it._id !== item._id);
              }).catch((err) => {
                common_vendor.index.showToast({
                  title: "删除失败",
                  icon: "none"
                });
              }).finally(() => {
                common_vendor.index.hideLoading();
              });
            }
          })
        });
      });
    },
    load({ group_id }) {
      var _a;
      this.where.group_id = group_id;
      this.$refs.udb.loadData();
      const groupObj = uni_modules_uniIm_sdk_index.uniIm.group.find(group_id);
      this.isAdmin = (_a = groupObj == null ? void 0 : groupObj.member.find(uni_modules_uniIm_sdk_index.uniIm.currentUser._id)) == null ? void 0 : _a.role.includes("admin");
    },
    toEdit(_id) {
      const dataList = this.$refs.udb.dataList;
      const events = {
        update(value) {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/group/notice/list.vue:98", "events update", value);
          dataList.forEach((item) => {
            if (item._id === value._id) {
              Object.assign(item, value);
            }
          });
        },
        add(value) {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/pages/group/notice/list.vue:106", "events add", value);
          dataList.unshift(value);
        }
      };
      if (uni_modules_uniIm_sdk_index.uniIm.isWidescreen) {
        this.$refs["notice-edit-pop"].open();
        setTimeout(() => {
          this.$refs["notice-edit"].load({
            _id,
            group_id: this.where.group_id
          }, events);
        }, 0);
      } else {
        let url = "/uni_modules/uni-im/pages/group/notice/edit?group_id=" + this.where.group_id;
        if (_id) {
          url += "&_id=" + _id;
        }
        common_vendor.index.navigateTo({
          url,
          events
        });
      }
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_im_msg2 = common_vendor.resolveComponent("uni-im-msg");
  const _easycom_uni_im_load_state2 = common_vendor.resolveComponent("uni-im-load-state");
  const _easycom_unicloud_db2 = common_vendor.resolveComponent("unicloud-db");
  const _easycom_uni_fab2 = common_vendor.resolveComponent("uni-fab");
  const _component_notice_edit = common_vendor.resolveComponent("notice-edit");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_im_msg2 + _easycom_uni_im_load_state2 + _easycom_unicloud_db2 + _easycom_uni_fab2 + _component_notice_edit + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../../../uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_im_msg = () => "../../../components/uni-im-msg/uni-im-msg.js";
const _easycom_uni_im_load_state = () => "../../../components/uni-im-load-state/uni-im-load-state.js";
const _easycom_unicloud_db = () => "../../../../../node-modules/@dcloudio/uni-components/lib/unicloud-db/unicloud-db.js";
const _easycom_uni_fab = () => "../../../../uni-fab/components/uni-fab/uni-fab.js";
const _easycom_uni_popup = () => "../../../../uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_im_msg + _easycom_uni_im_load_state + _easycom_unicloud_db + _easycom_uni_fab + _easycom_uni_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: _ctx.isWidescreen
  }, _ctx.isWidescreen ? {
    b: common_vendor.o(($event) => _ctx.$emit("close")),
    c: common_vendor.p({
      type: "clear",
      size: "20",
      color: "#BBB"
    })
  } : {}, {
    d: common_vendor.w(({
      data,
      loading,
      error,
      options
    }, s0, i0) => {
      return common_vendor.e({
        a: common_vendor.f(data, (item, index, i1) => {
          return common_vendor.e({
            a: "bb962de4-2-" + i0 + "-" + i1 + ",bb962de4-1",
            b: common_vendor.p({
              msg: __spreadProps(__spreadValues({}, item.content), {
                "from_uid": item.user_id,
                "create_time": item.create_time
              }),
              preview: true
            })
          }, $data.isAdmin ? {
            c: common_vendor.o(($event) => $options.remove(item), index),
            d: common_vendor.o(($event) => $options.toEdit(item._id), index)
          } : {}, {
            e: index
          });
        }),
        b: "bb962de4-3-" + i0 + ",bb962de4-1",
        c: common_vendor.p({
          status: loading ? "loading" : "",
          contentText: {
            "contentrefresh": "加载中...",
            "contentnomore": data.length ? "没有更多了" : "暂无数据"
          }
        }),
        d: error
      }, error ? {
        e: common_vendor.t(error.message)
      } : {}, {
        f: i0,
        g: s0
      });
    }, {
      name: "d",
      path: "d",
      vueId: "bb962de4-1"
    }),
    e: $data.isAdmin,
    f: common_vendor.sr("udb", "bb962de4-1"),
    g: common_vendor.p({
      collection: "uni-im-group-notice",
      loadtime: "manual",
      where: $data.where,
      orderby: "create_time desc"
    }),
    h: $data.isAdmin
  }, $data.isAdmin ? {
    i: common_vendor.o(($event) => $options.toEdit(false)),
    j: common_vendor.p({
      horizontal: "right"
    })
  } : {}, {
    k: common_vendor.sr("notice-edit", "bb962de4-6,bb962de4-5"),
    l: common_vendor.o(($event) => _ctx.$refs["notice-edit-pop"].close()),
    m: common_vendor.sr("notice-edit-pop", "bb962de4-5"),
    n: common_vendor.p({
      type: "center"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/pages/group/notice/list.js.map
