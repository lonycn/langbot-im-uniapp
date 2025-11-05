"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
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
require("../state/index.js");
const uni_modules_uniIm_sdk_utils_index = require("../utils/index.js");
const dbJQL = common_vendor.tr.databaseForJQL();
dbJQL.command;
dbJQL.command.aggregate;
class CloudData {
  constructor() {
    __publicField(this, "dataList", []);
    __publicField(this, "hasMore", true);
    __publicField(this, "loading", false);
    __publicField(this, "loadLimit", 100);
    __publicField(this, "indexKey", "_id");
    __publicField(this, "__getMoreQueue", []);
    // 被哪个类继承
    __publicField(this, "inheritedBy", "");
    if (this.indexKey) {
      this.dataMap = /* @__PURE__ */ new Map();
    }
  }
  reset() {
    this.dataList.length = 0;
    this.hasMore = true;
    this.loading = false;
    if (this.indexKey) {
      this.dataMap.clear();
    }
  }
  remove(param) {
    let item = this.find(param);
    if (item) {
      if (Array.isArray(this.dataList)) {
        this.dataList.splice(this.dataList.indexOf(item), 1);
      } else {
        delete this.dataList[item._id];
      }
      if (this.indexKey) {
        let key;
        this.indexKey.split(".").forEach((k) => {
          key = key ? key[k] : item[k];
        });
        this.dataMap.delete(key);
      }
    }
    this.__afterRemove(item);
  }
  __beforeRemove(param) {
    return param;
  }
  __afterRemove(param) {
    return param;
  }
  __beforeFind(param) {
    return param;
  }
  /**
   * @description 查找本地中存在的数据
   * @param {Object} param 查找条件，如果为空则返回全部数据，否则返回查找到的1条数据
   */
  find(param) {
    var _a;
    if (!param) {
      throw new Error("请传入查找条件");
    }
    const dataList = this.dataList;
    param = this.__beforeFind(param);
    let res;
    if (this.indexKey) {
      const indexKeyArr = this.indexKey.split(".");
      let mapKey = false;
      if (indexKeyArr.length == 1 && typeof param == "string") {
        mapKey = param;
      } else if (typeof param == "object" && convertObjToString(param) === this.indexKey) {
        let key;
        indexKeyArr.forEach((k) => {
          key = key ? key[k] : param[k];
        });
        mapKey = key;
      }
      if (mapKey) {
        res = this.dataMap.get(mapKey);
      } else {
        common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/ext/CloudData.class.js:94", "注意：此次查找未走索引", param, this.indexKey, this.constructor.name);
      }
    }
    if (!res) {
      if (typeof param == "string") {
        res = dataList.find((item) => item._id == param);
      } else if (typeof param == "object") {
        res = dataList.find((item) => isEq(item, param));
      } else {
        throw new Error("错误的查找条件");
      }
    }
    if (this.__afterFind) {
      res = (_a = this.__afterFind) == null ? void 0 : _a.call(this, { param, res });
    }
    return res;
  }
  /** @description 查询数据，先从本地查找，如果没有则从云端拉取
   * @param {Object} param 查找条件，如果为空则返回全部数据，否则返回查找到的1条数据
   */
  get(param) {
    return __async(this, null, function* () {
      if (this.inheritedBy === "conversation")
        ;
      if (!param) {
        throw new Error("请传入查找条件");
      }
      let data = this.find(param);
      if (!data) {
        data = yield this.loadMore(param);
      }
      this.__afterGet(data);
      return data;
    });
  }
  __afterGet(param) {
    return param;
  }
  count() {
    return this.dataList.length;
  }
  __get(param) {
    common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/ext/CloudData.class.js:143", "CloudData.pullData is not implemented");
    return param;
  }
  getMore(param) {
    return __async(this, null, function* () {
      var _a;
      if (!param) {
        if (!this.hasMore) {
          common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/ext/CloudData.class.js:151", "没有更多数据了");
          return [];
        }
        if (this.loading) {
          yield new Promise((resolve, reject) => {
            common_vendor.index.__f__("warn", "at uni_modules/uni-im/sdk/ext/CloudData.class.js:156", "正在加载中，本次请求进入列队。模块名称:" + this.constructor.name);
            this.__getMoreQueue.push({ resolve, reject });
          });
          common_vendor.index.__f__("log", "at uni_modules/uni-im/sdk/ext/CloudData.class.js:159", "列队任务已开始执行。模块名称:" + this.constructor.name);
        } else {
          this.loading = true;
        }
      }
      let datas = [];
      try {
        datas = yield this.__get(param);
        if (!param) {
          this.hasMore = datas.length === this.loadLimit;
          this.loading = false;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/ext/CloudData.class.js:172", "loadMore err", e);
        this.loading = false;
        common_vendor.index.showToast({
          title: e.message,
          icon: "none"
        });
      }
      (_a = this.__afterGetMore) == null ? void 0 : _a.call(this, datas);
      if (this.__getMoreQueue.length > 0) {
        const item = this.__getMoreQueue.shift();
        item.resolve();
      }
      return datas;
    });
  }
  loadMore(param) {
    return __async(this, null, function* () {
      let datas = yield this.getMore(param);
      if (datas.length > 0) {
        datas = this.add(datas, { canSetIsFull: true });
      }
      return param == void 0 ? datas : datas[0];
    });
  }
  set(data) {
    if (!data)
      return;
    let item = this.find(data.id || data._id || Object.keys(data)[0]);
    if (item) {
      try {
        uni_modules_uniIm_sdk_utils_index.utils.deepAssign(item, data);
      } catch (e) {
        common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/ext/CloudData.class.js:204", "合并更新出错", { item, data, e });
      }
      return item;
    } else {
      return this.add(data);
    }
  }
  __beforeAdd(param) {
    return param;
  }
  add(param, options = {}) {
    const { canUpdate = true, unshift = false } = options;
    const paramIsArray = Array.isArray(param);
    let datas = paramIsArray ? param : [param];
    let res = this.__beforeAdd(datas, options);
    if (res !== void 0) {
      datas = res;
    }
    const isEmpty = this.dataList.length === 0;
    const resData = datas.map((item) => {
      let val;
      if (this.indexKey) {
        this.indexKey.split(".").forEach((k) => {
          val = val ? val[k] : item[k];
        });
      } else {
        val = item._id || item.id || { [Object.keys(item)[0]]: item[Object.keys(item)[0]] };
      }
      let _data = isEmpty || !val ? false : this.find(val);
      if (_data) {
        if (canUpdate && item != _data) {
          try {
            uni_modules_uniIm_sdk_utils_index.utils.deepAssign(_data, item);
          } catch (e) {
            common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/ext/CloudData.class.js:248", "合并更新出错", { item, _data, e });
          }
        }
        return _data;
      } else {
        if (unshift) {
          this.dataList.unshift(item);
          item = this.dataList.slice(0, 1)[0];
        } else {
          this.dataList.push(item);
          item = this.dataList.slice(-1)[0];
        }
        if (this.indexKey) {
          let key;
          this.indexKey.split(".").forEach((k) => {
            key = key ? key[k] : item[k];
          });
          const cs = this.__canSeaveToDataMap;
          const val2 = cs ? cs(item) : true;
          if (val2) {
            this.dataMap.set(key, item);
          }
        }
        return item;
      }
    });
    this.__afterAdd(resData, options);
    return paramIsArray ? resData : resData[0];
  }
  __afterAdd(param) {
    return param;
  }
  update(param, data) {
    let item = this.find(param);
    if (item) {
      Object.assign(item, data);
    }
    return item;
  }
}
function convertObjToString(obj) {
  let result = "";
  function recursiveConvert(currentObj, path) {
    for (const key in currentObj) {
      const value = currentObj[key];
      const newPath = path ? `${path}.${key}` : key;
      if (typeof value === "object") {
        recursiveConvert(value, newPath);
      } else {
        result += `${newPath}`;
      }
    }
  }
  recursiveConvert(obj, "");
  return result;
}
function isEq(a, b) {
  if (Array.isArray(a) || Array.isArray(b)) {
    common_vendor.index.__f__("error", "at uni_modules/uni-im/sdk/ext/CloudData.class.js:314", "不支持数组比较");
    return a === b;
  }
  let result = true;
  for (let key in b) {
    const valueA = a[key];
    const valueB = b[key];
    if (typeof valueB === "object" && valueB !== null && typeof valueA === "object" && valueA !== null) {
      return isEq(valueA, valueB);
    }
    result = valueA === valueB;
    if (!result) {
      break;
    }
  }
  return result;
}
exports.CloudData = CloudData;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/uni-im/sdk/ext/CloudData.class.js.map
