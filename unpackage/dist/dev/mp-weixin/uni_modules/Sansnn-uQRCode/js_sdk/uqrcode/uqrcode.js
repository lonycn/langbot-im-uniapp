"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b2) => {
  for (var prop in b2 || (b2 = {}))
    if (__hasOwnProp.call(b2, prop))
      __defNormalProp(a, prop, b2[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b2)) {
      if (__propIsEnum.call(b2, prop))
        __defNormalProp(a, prop, b2[prop]);
    }
  return a;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e2) {
        reject(e2);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e2) {
        reject(e2);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const common_vendor = require("../../../../common/vendor.js");
function o(o2) {
  this.mode = r.MODE_8BIT_BYTE, this.data = o2;
}
function e(o2, e2) {
  this.typeNumber = o2, this.errorCorrectLevel = e2, this.modules = null, this.moduleCount = 0, this.dataCache = null, this.dataList = new Array();
}
o.prototype = { getLength: function(o2) {
  return this.data.length;
}, write: function(o2) {
  for (var e2 = 0; e2 < this.data.length; e2++)
    o2.put(this.data.charCodeAt(e2), 8);
} }, e.prototype = { addData: function(e2) {
  var r = new o(e2);
  this.dataList.push(r), this.dataCache = null;
}, isDark: function(o2, e2) {
  if (o2 < 0 || this.moduleCount <= o2 || e2 < 0 || this.moduleCount <= e2)
    throw new Error(o2 + "," + e2);
  return this.modules[o2][e2];
}, getModuleCount: function() {
  return this.moduleCount;
}, make: function() {
  if (this.typeNumber < 1) {
    var o2 = 1;
    for (o2 = 1; o2 < 40; o2++) {
      for (var e2 = v.getRSBlocks(o2, this.errorCorrectLevel), r = new p(), t = 0, i = 0; i < e2.length; i++)
        t += e2[i].dataCount;
      for (i = 0; i < this.dataList.length; i++) {
        var n = this.dataList[i];
        r.put(n.mode, 4), r.put(n.getLength(), h.getLengthInBits(n.mode, o2)), n.write(r);
      }
      if (r.getLengthInBits() <= 8 * t)
        break;
    }
    this.typeNumber = o2;
  }
  this.makeImpl(false, this.getBestMaskPattern());
}, makeImpl: function(o2, r) {
  this.moduleCount = 4 * this.typeNumber + 17, this.modules = new Array(this.moduleCount);
  for (var t = 0; t < this.moduleCount; t++) {
    this.modules[t] = new Array(this.moduleCount);
    for (var i = 0; i < this.moduleCount; i++)
      this.modules[t][i] = null;
  }
  this.setupPositionProbePattern(0, 0), this.setupPositionProbePattern(this.moduleCount - 7, 0), this.setupPositionProbePattern(0, this.moduleCount - 7), this.setupPositionAdjustPattern(), this.setupTimingPattern(), this.setupTypeInfo(o2, r), this.typeNumber >= 7 && this.setupTypeNumber(o2), null == this.dataCache && (this.dataCache = e.createData(this.typeNumber, this.errorCorrectLevel, this.dataList)), this.mapData(this.dataCache, r);
}, setupPositionProbePattern: function(o2, e2) {
  for (var r = -1; r <= 7; r++)
    if (!(o2 + r <= -1 || this.moduleCount <= o2 + r))
      for (var t = -1; t <= 7; t++)
        e2 + t <= -1 || this.moduleCount <= e2 + t || (this.modules[o2 + r][e2 + t] = 0 <= r && r <= 6 && (0 == t || 6 == t) || 0 <= t && t <= 6 && (0 == r || 6 == r) || 2 <= r && r <= 4 && 2 <= t && t <= 4);
}, getBestMaskPattern: function() {
  for (var o2 = 0, e2 = 0, r = 0; r < 8; r++) {
    this.makeImpl(true, r);
    var t = h.getLostPoint(this);
    (0 == r || o2 > t) && (o2 = t, e2 = r);
  }
  return e2;
}, createMovieClip: function(o2, e2, r) {
  var t = o2.createEmptyMovieClip(e2, r);
  this.make();
  for (var i = 0; i < this.modules.length; i++)
    for (var n = 1 * i, a = 0; a < this.modules[i].length; a++) {
      var d = 1 * a;
      this.modules[i][a] && (t.beginFill(0, 100), t.moveTo(d, n), t.lineTo(d + 1, n), t.lineTo(d + 1, n + 1), t.lineTo(d, n + 1), t.endFill());
    }
  return t;
}, setupTimingPattern: function() {
  for (var o2 = 8; o2 < this.moduleCount - 8; o2++)
    null == this.modules[o2][6] && (this.modules[o2][6] = o2 % 2 == 0);
  for (var e2 = 8; e2 < this.moduleCount - 8; e2++)
    null == this.modules[6][e2] && (this.modules[6][e2] = e2 % 2 == 0);
}, setupPositionAdjustPattern: function() {
  for (var o2 = h.getPatternPosition(this.typeNumber), e2 = 0; e2 < o2.length; e2++)
    for (var r = 0; r < o2.length; r++) {
      var t = o2[e2], i = o2[r];
      if (null == this.modules[t][i])
        for (var n = -2; n <= 2; n++)
          for (var a = -2; a <= 2; a++)
            this.modules[t + n][i + a] = -2 == n || 2 == n || -2 == a || 2 == a || 0 == n && 0 == a;
    }
}, setupTypeNumber: function(o2) {
  for (var e2 = h.getBCHTypeNumber(this.typeNumber), r = 0; r < 18; r++) {
    var t = !o2 && 1 == (e2 >> r & 1);
    this.modules[Math.floor(r / 3)][r % 3 + this.moduleCount - 8 - 3] = t;
  }
  for (r = 0; r < 18; r++) {
    t = !o2 && 1 == (e2 >> r & 1);
    this.modules[r % 3 + this.moduleCount - 8 - 3][Math.floor(r / 3)] = t;
  }
}, setupTypeInfo: function(o2, e2) {
  for (var r = this.errorCorrectLevel << 3 | e2, t = h.getBCHTypeInfo(r), i = 0; i < 15; i++) {
    var n = !o2 && 1 == (t >> i & 1);
    i < 6 ? this.modules[i][8] = n : i < 8 ? this.modules[i + 1][8] = n : this.modules[this.moduleCount - 15 + i][8] = n;
  }
  for (i = 0; i < 15; i++) {
    n = !o2 && 1 == (t >> i & 1);
    i < 8 ? this.modules[8][this.moduleCount - i - 1] = n : i < 9 ? this.modules[8][15 - i - 1 + 1] = n : this.modules[8][15 - i - 1] = n;
  }
  this.modules[this.moduleCount - 8][8] = !o2;
}, mapData: function(o2, e2) {
  for (var r = -1, t = this.moduleCount - 1, i = 7, n = 0, a = this.moduleCount - 1; a > 0; a -= 2)
    for (6 == a && a--; ; ) {
      for (var d = 0; d < 2; d++)
        if (null == this.modules[t][a - d]) {
          var u = false;
          n < o2.length && (u = 1 == (o2[n] >>> i & 1)), h.getMask(e2, t, a - d) && (u = !u), this.modules[t][a - d] = u, -1 == --i && (n++, i = 7);
        }
      if ((t += r) < 0 || this.moduleCount <= t) {
        t -= r, r = -r;
        break;
      }
    }
} }, e.PAD0 = 236, e.PAD1 = 17, e.createData = function(o2, r, t) {
  for (var i = v.getRSBlocks(o2, r), n = new p(), a = 0; a < t.length; a++) {
    var d = t[a];
    n.put(d.mode, 4), n.put(d.getLength(), h.getLengthInBits(d.mode, o2)), d.write(n);
  }
  var u = 0;
  for (a = 0; a < i.length; a++)
    u += i[a].dataCount;
  if (n.getLengthInBits() > 8 * u)
    throw new Error("code length overflow. (" + n.getLengthInBits() + ">" + 8 * u + ")");
  for (n.getLengthInBits() + 4 <= 8 * u && n.put(0, 4); n.getLengthInBits() % 8 != 0; )
    n.putBit(false);
  for (; !(n.getLengthInBits() >= 8 * u || (n.put(e.PAD0, 8), n.getLengthInBits() >= 8 * u)); )
    n.put(e.PAD1, 8);
  return e.createBytes(n, i);
}, e.createBytes = function(o2, e2) {
  for (var r = 0, t = 0, i = 0, n = new Array(e2.length), a = new Array(e2.length), d = 0; d < e2.length; d++) {
    var u = e2[d].dataCount, s = e2[d].totalCount - u;
    t = Math.max(t, u), i = Math.max(i, s), n[d] = new Array(u);
    for (var g = 0; g < n[d].length; g++)
      n[d][g] = 255 & o2.buffer[g + r];
    r += u;
    var l = h.getErrorCorrectPolynomial(s), c = new f(n[d], l.getLength() - 1).mod(l);
    a[d] = new Array(l.getLength() - 1);
    for (g = 0; g < a[d].length; g++) {
      var m = g + c.getLength() - a[d].length;
      a[d][g] = m >= 0 ? c.get(m) : 0;
    }
  }
  var v2 = 0;
  for (g = 0; g < e2.length; g++)
    v2 += e2[g].totalCount;
  var p2 = new Array(v2), C2 = 0;
  for (g = 0; g < t; g++)
    for (d = 0; d < e2.length; d++)
      g < n[d].length && (p2[C2++] = n[d][g]);
  for (g = 0; g < i; g++)
    for (d = 0; d < e2.length; d++)
      g < a[d].length && (p2[C2++] = a[d][g]);
  return p2;
};
for (var r = { MODE_NUMBER: 1, MODE_ALPHA_NUM: 2, MODE_8BIT_BYTE: 4, MODE_KANJI: 8 }, t = { L: 1, M: 0, Q: 3, H: 2 }, i = 0, n = 1, a = 2, d = 3, u = 4, s = 5, g = 6, l = 7, h = { PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]], G15: 1335, G18: 7973, G15_MASK: 21522, getBCHTypeInfo: function(o2) {
  for (var e2 = o2 << 10; h.getBCHDigit(e2) - h.getBCHDigit(h.G15) >= 0; )
    e2 ^= h.G15 << h.getBCHDigit(e2) - h.getBCHDigit(h.G15);
  return (o2 << 10 | e2) ^ h.G15_MASK;
}, getBCHTypeNumber: function(o2) {
  for (var e2 = o2 << 12; h.getBCHDigit(e2) - h.getBCHDigit(h.G18) >= 0; )
    e2 ^= h.G18 << h.getBCHDigit(e2) - h.getBCHDigit(h.G18);
  return o2 << 12 | e2;
}, getBCHDigit: function(o2) {
  for (var e2 = 0; 0 != o2; )
    e2++, o2 >>>= 1;
  return e2;
}, getPatternPosition: function(o2) {
  return h.PATTERN_POSITION_TABLE[o2 - 1];
}, getMask: function(o2, e2, r2) {
  switch (o2) {
    case i:
      return (e2 + r2) % 2 == 0;
    case n:
      return e2 % 2 == 0;
    case a:
      return r2 % 3 == 0;
    case d:
      return (e2 + r2) % 3 == 0;
    case u:
      return (Math.floor(e2 / 2) + Math.floor(r2 / 3)) % 2 == 0;
    case s:
      return e2 * r2 % 2 + e2 * r2 % 3 == 0;
    case g:
      return (e2 * r2 % 2 + e2 * r2 % 3) % 2 == 0;
    case l:
      return (e2 * r2 % 3 + (e2 + r2) % 2) % 2 == 0;
    default:
      throw new Error("bad maskPattern:" + o2);
  }
}, getErrorCorrectPolynomial: function(o2) {
  for (var e2 = new f([1], 0), r2 = 0; r2 < o2; r2++)
    e2 = e2.multiply(new f([1, c.gexp(r2)], 0));
  return e2;
}, getLengthInBits: function(o2, e2) {
  if (1 <= e2 && e2 < 10)
    switch (o2) {
      case r.MODE_NUMBER:
        return 10;
      case r.MODE_ALPHA_NUM:
        return 9;
      case r.MODE_8BIT_BYTE:
      case r.MODE_KANJI:
        return 8;
      default:
        throw new Error("mode:" + o2);
    }
  else if (e2 < 27)
    switch (o2) {
      case r.MODE_NUMBER:
        return 12;
      case r.MODE_ALPHA_NUM:
        return 11;
      case r.MODE_8BIT_BYTE:
        return 16;
      case r.MODE_KANJI:
        return 10;
      default:
        throw new Error("mode:" + o2);
    }
  else {
    if (!(e2 < 41))
      throw new Error("type:" + e2);
    switch (o2) {
      case r.MODE_NUMBER:
        return 14;
      case r.MODE_ALPHA_NUM:
        return 13;
      case r.MODE_8BIT_BYTE:
        return 16;
      case r.MODE_KANJI:
        return 12;
      default:
        throw new Error("mode:" + o2);
    }
  }
}, getLostPoint: function(o2) {
  for (var e2 = o2.getModuleCount(), r2 = 0, t2 = 0; t2 < e2; t2++)
    for (var i2 = 0; i2 < e2; i2++) {
      for (var n2 = 0, a2 = o2.isDark(t2, i2), d2 = -1; d2 <= 1; d2++)
        if (!(t2 + d2 < 0 || e2 <= t2 + d2))
          for (var u2 = -1; u2 <= 1; u2++)
            i2 + u2 < 0 || e2 <= i2 + u2 || 0 == d2 && 0 == u2 || a2 == o2.isDark(t2 + d2, i2 + u2) && n2++;
      n2 > 5 && (r2 += 3 + n2 - 5);
    }
  for (t2 = 0; t2 < e2 - 1; t2++)
    for (i2 = 0; i2 < e2 - 1; i2++) {
      var s2 = 0;
      o2.isDark(t2, i2) && s2++, o2.isDark(t2 + 1, i2) && s2++, o2.isDark(t2, i2 + 1) && s2++, o2.isDark(t2 + 1, i2 + 1) && s2++, 0 != s2 && 4 != s2 || (r2 += 3);
    }
  for (t2 = 0; t2 < e2; t2++)
    for (i2 = 0; i2 < e2 - 6; i2++)
      o2.isDark(t2, i2) && !o2.isDark(t2, i2 + 1) && o2.isDark(t2, i2 + 2) && o2.isDark(t2, i2 + 3) && o2.isDark(t2, i2 + 4) && !o2.isDark(t2, i2 + 5) && o2.isDark(t2, i2 + 6) && (r2 += 40);
  for (i2 = 0; i2 < e2; i2++)
    for (t2 = 0; t2 < e2 - 6; t2++)
      o2.isDark(t2, i2) && !o2.isDark(t2 + 1, i2) && o2.isDark(t2 + 2, i2) && o2.isDark(t2 + 3, i2) && o2.isDark(t2 + 4, i2) && !o2.isDark(t2 + 5, i2) && o2.isDark(t2 + 6, i2) && (r2 += 40);
  var g2 = 0;
  for (i2 = 0; i2 < e2; i2++)
    for (t2 = 0; t2 < e2; t2++)
      o2.isDark(t2, i2) && g2++;
  return r2 += 10 * (Math.abs(100 * g2 / e2 / e2 - 50) / 5);
} }, c = { glog: function(o2) {
  if (o2 < 1)
    throw new Error("glog(" + o2 + ")");
  return c.LOG_TABLE[o2];
}, gexp: function(o2) {
  for (; o2 < 0; )
    o2 += 255;
  for (; o2 >= 256; )
    o2 -= 255;
  return c.EXP_TABLE[o2];
}, EXP_TABLE: new Array(256), LOG_TABLE: new Array(256) }, m = 0; m < 8; m++)
  c.EXP_TABLE[m] = 1 << m;
for (m = 8; m < 256; m++)
  c.EXP_TABLE[m] = c.EXP_TABLE[m - 4] ^ c.EXP_TABLE[m - 5] ^ c.EXP_TABLE[m - 6] ^ c.EXP_TABLE[m - 8];
for (m = 0; m < 255; m++)
  c.LOG_TABLE[c.EXP_TABLE[m]] = m;
function f(o2, e2) {
  if (null == o2.length)
    throw new Error(o2.length + "/" + e2);
  for (var r = 0; r < o2.length && 0 == o2[r]; )
    r++;
  this.num = new Array(o2.length - r + e2);
  for (var t = 0; t < o2.length - r; t++)
    this.num[t] = o2[t + r];
}
function v(o2, e2) {
  this.totalCount = o2, this.dataCount = e2;
}
function p() {
  this.buffer = new Array(), this.length = 0;
}
function C(o2) {
  return o2.setFillStyle = o2.setFillStyle || function(e2) {
    o2.fillStyle = e2;
  }, o2.setFontSize = o2.setFontSize || function(e2) {
    o2.font = `${e2}px`;
  }, o2.setTextAlign = o2.setTextAlign || function(e2) {
    o2.textAlign = e2;
  }, o2.setTextBaseline = o2.setTextBaseline || function(e2) {
    o2.textBaseline = e2;
  }, o2.setGlobalAlpha = o2.setGlobalAlpha || function(e2) {
    o2.globalAlpha = e2;
  }, o2.setStrokeStyle = o2.setStrokeStyle || function(e2) {
    o2.strokeStyle = e2;
  }, o2.setShadow = o2.setShadow || function(e2, r, t, i) {
    o2.shadowOffsetX = e2, o2.shadowOffsetY = r, o2.shadowBlur = t, o2.shadowColor = i;
  }, o2.draw = o2.draw || function(o3, e2) {
    e2 && e2();
  }, o2.clearRect = o2.clearRect || function(e2, r, t, i) {
    o2.draw(false);
  }, o2;
}
function b(o2, e2) {
  var r = this.data = "", t = this.size = 200;
  this.useDynamicSize = false, this.dynamicSize = t;
  var i = this.typeNumber = -1;
  this.errorCorrectLevel = b.errorCorrectLevel.H;
  var n = this.margin = 0;
  this.areaColor = "#FFFFFF", this.backgroundColor = "rgba(255,255,255,0)", this.backgroundImageSrc = void 0;
  var a = this.backgroundImageWidth = void 0, d = this.backgroundImageHeight = void 0, u = this.backgroundImageX = void 0, s = this.backgroundImageY = void 0;
  this.backgroundImageAlpha = 1, this.backgroundImageBorderRadius = 0;
  var g = this.backgroundPadding = 0;
  this.foregroundColor = "#000000", this.foregroundImageSrc = void 0;
  var l = this.foregroundImageWidth = void 0, h = this.foregroundImageHeight = void 0, c = this.foregroundImageX = void 0, m = this.foregroundImageY = void 0, f2 = this.foregroundImagePadding = 0;
  this.foregroundImageBackgroundColor = "#FFFFFF";
  var v2 = this.foregroundImageBorderRadius = 0, p2 = this.foregroundImageShadowOffsetX = 0, k = this.foregroundImageShadowOffsetY = 0, y = this.foregroundImageShadowBlur = 0;
  this.foregroundImageShadowColor = "#808080";
  var w = this.foregroundPadding = 0, I = this.positionProbeBackgroundColor = void 0, B = this.positionProbeForegroundColor = void 0, S = this.separatorColor = void 0, P = this.positionAdjustBackgroundColor = void 0, L = this.positionAdjustForegroundColor = void 0, D = this.timingBackgroundColor = void 0, A = this.timingForegroundColor = void 0, E = this.typeNumberBackgroundColor = void 0, T = this.typeNumberForegroundColor = void 0, N = this.darkBlockColor = void 0;
  this.base = void 0, this.modules = [], this.moduleCount = 0, this.drawModules = [];
  var M = this.canvasContext = void 0;
  this.loadImage, this.drawReserve = false, this.isMaked = false, Object.defineProperties(this, { data: { get() {
    if ("" === r || void 0 === r)
      throw common_vendor.index.__f__("error", "at uni_modules/Sansnn-uQRCode/js_sdk/uqrcode/uqrcode.js:34", "[uQRCode]: data must be set!"), new b.Error("data must be set!");
    return r;
  }, set(o3) {
    r = String(o3);
  } }, size: { get: () => t, set(o3) {
    t = Number(o3);
  } }, typeNumber: { get: () => i, set(o3) {
    i = Number(o3);
  } }, margin: { get: () => n, set(o3) {
    n = Number(o3);
  } }, backgroundImageWidth: { get() {
    return void 0 === a ? this.dynamicSize : this.useDynamicSize ? this.dynamicSize / this.size * a : a;
  }, set(o3) {
    a = Number(o3);
  } }, backgroundImageHeight: { get() {
    return void 0 === d ? this.dynamicSize : this.useDynamicSize ? this.dynamicSize / this.size * d : d;
  }, set(o3) {
    d = Number(o3);
  } }, backgroundImageX: { get() {
    return void 0 === u ? 0 : this.useDynamicSize ? this.dynamicSize / this.size * u : u;
  }, set(o3) {
    u = Number(o3);
  } }, backgroundImageY: { get() {
    return void 0 === s ? 0 : this.useDynamicSize ? this.dynamicSize / this.size * s : s;
  }, set(o3) {
    s = Number(o3);
  } }, backgroundPadding: { get: () => g, set(o3) {
    g = o3 > 1 ? 1 : o3 < 0 ? 0 : o3;
  } }, foregroundImageWidth: { get() {
    return void 0 === l ? (this.dynamicSize - 2 * this.margin) / 4 : this.useDynamicSize ? this.dynamicSize / this.size * l : l;
  }, set(o3) {
    l = Number(o3);
  } }, foregroundImageHeight: { get() {
    return void 0 === h ? (this.dynamicSize - 2 * this.margin) / 4 : this.useDynamicSize ? this.dynamicSize / this.size * h : h;
  }, set(o3) {
    h = Number(o3);
  } }, foregroundImageX: { get() {
    return void 0 === c ? this.dynamicSize / 2 - this.foregroundImageWidth / 2 : this.useDynamicSize ? this.dynamicSize / this.size * c : c;
  }, set(o3) {
    c = Number(o3);
  } }, foregroundImageY: { get() {
    return void 0 === m ? this.dynamicSize / 2 - this.foregroundImageHeight / 2 : this.useDynamicSize ? this.dynamicSize / this.size * m : m;
  }, set(o3) {
    m = Number(o3);
  } }, foregroundImagePadding: { get() {
    return this.useDynamicSize ? this.dynamicSize / this.size * f2 : f2;
  }, set(o3) {
    f2 = Number(o3);
  } }, foregroundImageBorderRadius: { get() {
    return this.useDynamicSize ? this.dynamicSize / this.size * v2 : v2;
  }, set(o3) {
    v2 = Number(o3);
  } }, foregroundImageShadowOffsetX: { get() {
    return this.useDynamicSize ? this.dynamicSize / this.size * p2 : p2;
  }, set(o3) {
    p2 = Number(o3);
  } }, foregroundImageShadowOffsetY: { get() {
    return this.useDynamicSize ? this.dynamicSize / this.size * k : k;
  }, set(o3) {
    k = Number(o3);
  } }, foregroundImageShadowBlur: { get() {
    return this.useDynamicSize ? this.dynamicSize / this.size * y : y;
  }, set(o3) {
    y = Number(o3);
  } }, foregroundPadding: { get: () => w, set(o3) {
    w = o3 > 1 ? 1 : o3 < 0 ? 0 : o3;
  } }, positionProbeBackgroundColor: { get() {
    return I || this.backgroundColor;
  }, set(o3) {
    I = o3;
  } }, positionProbeForegroundColor: { get() {
    return B || this.foregroundColor;
  }, set(o3) {
    B = o3;
  } }, separatorColor: { get() {
    return S || this.backgroundColor;
  }, set(o3) {
    S = o3;
  } }, positionAdjustBackgroundColor: { get() {
    return P || this.backgroundColor;
  }, set(o3) {
    P = o3;
  } }, positionAdjustForegroundColor: { get() {
    return L || this.foregroundColor;
  }, set(o3) {
    L = o3;
  } }, timingBackgroundColor: { get() {
    return D || this.backgroundColor;
  }, set(o3) {
    D = o3;
  } }, timingForegroundColor: { get() {
    return A || this.foregroundColor;
  }, set(o3) {
    A = o3;
  } }, typeNumberBackgroundColor: { get() {
    return E || this.backgroundColor;
  }, set(o3) {
    E = o3;
  } }, typeNumberForegroundColor: { get() {
    return T || this.foregroundColor;
  }, set(o3) {
    T = o3;
  } }, darkBlockColor: { get() {
    return N || this.foregroundColor;
  }, set(o3) {
    N = o3;
  } }, canvasContext: { get() {
    if (void 0 === M)
      throw common_vendor.index.__f__("error", "at uni_modules/Sansnn-uQRCode/js_sdk/uqrcode/uqrcode.js:34", "[uQRCode]: use drawCanvas, you need to set the canvasContext!"), new b.Error("use drawCanvas, you need to set the canvasContext!");
    return M;
  }, set(o3) {
    M = C(o3);
  } } }), b.plugins.forEach((o3) => o3(b, this, false)), o2 && this.setOptions(o2), e2 && (this.canvasContext = C(e2));
}
f.prototype = { get: function(o2) {
  return this.num[o2];
}, getLength: function() {
  return this.num.length;
}, multiply: function(o2) {
  for (var e2 = new Array(this.getLength() + o2.getLength() - 1), r = 0; r < this.getLength(); r++)
    for (var t = 0; t < o2.getLength(); t++)
      e2[r + t] ^= c.gexp(c.glog(this.get(r)) + c.glog(o2.get(t)));
  return new f(e2, 0);
}, mod: function(o2) {
  if (this.getLength() - o2.getLength() < 0)
    return this;
  for (var e2 = c.glog(this.get(0)) - c.glog(o2.get(0)), r = new Array(this.getLength()), t = 0; t < this.getLength(); t++)
    r[t] = this.get(t);
  for (t = 0; t < o2.getLength(); t++)
    r[t] ^= c.gexp(c.glog(o2.get(t)) + e2);
  return new f(r, 0).mod(o2);
} }, v.RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]], v.getRSBlocks = function(o2, e2) {
  var r = v.getRsBlockTable(o2, e2);
  if (null == r)
    throw new Error("bad rs block @ typeNumber:" + o2 + "/errorCorrectLevel:" + e2);
  for (var t = r.length / 3, i = new Array(), n = 0; n < t; n++)
    for (var a = r[3 * n + 0], d = r[3 * n + 1], u = r[3 * n + 2], s = 0; s < a; s++)
      i.push(new v(d, u));
  return i;
}, v.getRsBlockTable = function(o2, e2) {
  switch (e2) {
    case t.L:
      return v.RS_BLOCK_TABLE[4 * (o2 - 1) + 0];
    case t.M:
      return v.RS_BLOCK_TABLE[4 * (o2 - 1) + 1];
    case t.Q:
      return v.RS_BLOCK_TABLE[4 * (o2 - 1) + 2];
    case t.H:
      return v.RS_BLOCK_TABLE[4 * (o2 - 1) + 3];
    default:
      return;
  }
}, p.prototype = { get: function(o2) {
  var e2 = Math.floor(o2 / 8);
  return 1 == (this.buffer[e2] >>> 7 - o2 % 8 & 1);
}, put: function(o2, e2) {
  for (var r = 0; r < e2; r++)
    this.putBit(1 == (o2 >>> e2 - r - 1 & 1));
}, getLengthInBits: function() {
  return this.length;
}, putBit: function(o2) {
  var e2 = Math.floor(this.length / 8);
  this.buffer.length <= e2 && this.buffer.push(0), o2 && (this.buffer[e2] |= 128 >>> this.length % 8), this.length++;
} }, e.errorCorrectLevel = t, b.errorCorrectLevel = e.errorCorrectLevel, b.Error = function(o2) {
  this.errMsg = "[uQRCode]: " + o2;
}, b.plugins = [], b.use = function(o2) {
  "function" == typeof o2 && b.plugins.push(o2);
}, b.prototype.loadImage = function(o2) {
  return Promise.resolve(o2);
}, b.prototype.setOptions = function(o2) {
  var e2, r, t, i, n, a, d, u, s, g, l, h, c, m, f2, v2, p2, C2, b2, k, y, w, I, B, S, P, L, D, A, E, T, N, M, z, R, _, O, F, x, H, X, Y, j, W, G, K, Q, U, $, J, q, V, Z, oo, eo, ro;
  o2 && (Object.keys(o2).forEach((e3) => {
    this[e3] = o2[e3];
  }), function(o3 = {}, e3 = {}, r2 = false) {
    let t2;
    t2 = r2 ? o3 : __spreadValues({}, o3);
    for (let o4 in e3) {
      var i2 = e3[o4];
      null != i2 && (i2.constructor == Object ? t2[o4] = this.deepReplace(t2[o4], i2) : i2.constructor != String || i2 ? t2[o4] = i2 : t2[o4] = t2[o4]);
    }
  }(this, { data: o2.data || o2.text, size: o2.size, useDynamicSize: o2.useDynamicSize, typeNumber: o2.typeNumber, errorCorrectLevel: o2.errorCorrectLevel, margin: o2.margin, areaColor: o2.areaColor, backgroundColor: o2.backgroundColor || (null === (e2 = o2.background) || void 0 === e2 ? void 0 : e2.color), backgroundImageSrc: o2.backgroundImageSrc || (null === (r = o2.background) || void 0 === r || null === (t = r.image) || void 0 === t ? void 0 : t.src), backgroundImageWidth: o2.backgroundImageWidth || (null === (i = o2.background) || void 0 === i || null === (n = i.image) || void 0 === n ? void 0 : n.width), backgroundImageHeight: o2.backgroundImageHeight || (null === (a = o2.background) || void 0 === a || null === (d = a.image) || void 0 === d ? void 0 : d.height), backgroundImageX: o2.backgroundImageX || (null === (u = o2.background) || void 0 === u || null === (s = u.image) || void 0 === s ? void 0 : s.x), backgroundImageY: o2.backgroundImageY || (null === (g = o2.background) || void 0 === g || null === (l = g.image) || void 0 === l ? void 0 : l.y), backgroundImageAlpha: o2.backgroundImageAlpha || (null === (h = o2.background) || void 0 === h || null === (c = h.image) || void 0 === c ? void 0 : c.alpha), backgroundImageBorderRadius: o2.backgroundImageBorderRadius || (null === (m = o2.background) || void 0 === m || null === (f2 = m.image) || void 0 === f2 ? void 0 : f2.borderRadius), backgroundPadding: o2.backgroundPadding, foregroundColor: o2.foregroundColor || (null === (v2 = o2.foreground) || void 0 === v2 ? void 0 : v2.color), foregroundImageSrc: o2.foregroundImageSrc || (null === (p2 = o2.foreground) || void 0 === p2 || null === (C2 = p2.image) || void 0 === C2 ? void 0 : C2.src), foregroundImageWidth: o2.foregroundImageWidth || (null === (b2 = o2.foreground) || void 0 === b2 || null === (k = b2.image) || void 0 === k ? void 0 : k.width), foregroundImageHeight: o2.foregroundImageHeight || (null === (y = o2.foreground) || void 0 === y || null === (w = y.image) || void 0 === w ? void 0 : w.height), foregroundImageX: o2.foregroundImageX || (null === (I = o2.foreground) || void 0 === I || null === (B = I.image) || void 0 === B ? void 0 : B.x), foregroundImageY: o2.foregroundImageY || (null === (S = o2.foreground) || void 0 === S || null === (P = S.image) || void 0 === P ? void 0 : P.y), foregroundImagePadding: o2.foregroundImagePadding || (null === (L = o2.foreground) || void 0 === L || null === (D = L.image) || void 0 === D ? void 0 : D.padding), foregroundImageBackgroundColor: o2.foregroundImageBackgroundColor || (null === (A = o2.foreground) || void 0 === A || null === (E = A.image) || void 0 === E ? void 0 : E.backgroundColor), foregroundImageBorderRadius: o2.foregroundImageBorderRadius || (null === (T = o2.foreground) || void 0 === T || null === (N = T.image) || void 0 === N ? void 0 : N.borderRadius), foregroundImageShadowOffsetX: o2.foregroundImageShadowOffsetX || (null === (M = o2.foreground) || void 0 === M || null === (z = M.image) || void 0 === z ? void 0 : z.shadowOffsetX), foregroundImageShadowOffsetY: o2.foregroundImageShadowOffsetY || (null === (R = o2.foreground) || void 0 === R || null === (_ = R.image) || void 0 === _ ? void 0 : _.shadowOffsetY), foregroundImageShadowBlur: o2.foregroundImageShadowBlur || (null === (O = o2.foreground) || void 0 === O || null === (F = O.image) || void 0 === F ? void 0 : F.shadowBlur), foregroundImageShadowColor: o2.foregroundImageShadowColor || (null === (x = o2.foreground) || void 0 === x || null === (H = x.image) || void 0 === H ? void 0 : H.shadowColor), foregroundPadding: o2.foregroundPadding, positionProbeBackgroundColor: o2.positionProbeBackgroundColor || (null === (X = o2.positionProbe) || void 0 === X ? void 0 : X.backgroundColor) || (null === (Y = o2.positionDetection) || void 0 === Y ? void 0 : Y.backgroundColor), positionProbeForegroundColor: o2.positionProbeForegroundColor || (null === (j = o2.positionProbe) || void 0 === j ? void 0 : j.foregroundColor) || (null === (W = o2.positionDetection) || void 0 === W ? void 0 : W.foregroundColor), separatorColor: o2.separatorColor || (null === (G = o2.separator) || void 0 === G ? void 0 : G.color), positionAdjustBackgroundColor: o2.positionAdjustBackgroundColor || (null === (K = o2.positionAdjust) || void 0 === K ? void 0 : K.backgroundColor) || (null === (Q = o2.alignment) || void 0 === Q ? void 0 : Q.backgroundColor), positionAdjustForegroundColor: o2.positionAdjustForegroundColor || (null === (U = o2.positionAdjust) || void 0 === U ? void 0 : U.foregroundColor) || (null === ($ = o2.alignment) || void 0 === $ ? void 0 : $.foregroundColor), timingBackgroundColor: o2.timingBackgroundColor || (null === (J = o2.timing) || void 0 === J ? void 0 : J.backgroundColor), timingForegroundColor: o2.timingForegroundColor || (null === (q = o2.timing) || void 0 === q ? void 0 : q.foregroundColor), typeNumberBackgroundColor: o2.typeNumberBackgroundColor || (null === (V = o2.typeNumber) || void 0 === V ? void 0 : V.backgroundColor) || (null === (Z = o2.versionInformation) || void 0 === Z ? void 0 : Z.backgroundColor), typeNumberForegroundColor: o2.typeNumberForegroundColor || (null === (oo = o2.typeNumber) || void 0 === oo ? void 0 : oo.foregroundColor) || (null === (eo = o2.versionInformation) || void 0 === eo ? void 0 : eo.foregroundColor), darkBlockColor: o2.darkBlockColor || (null === (ro = o2.darkBlock) || void 0 === ro ? void 0 : ro.color) }, true));
}, b.prototype.make = function() {
  let { foregroundColor: o2, backgroundColor: r, typeNumber: t, errorCorrectLevel: i, data: n, size: a, margin: d, useDynamicSize: u } = this;
  if (o2 === r)
    throw common_vendor.index.__f__("error", "at uni_modules/Sansnn-uQRCode/js_sdk/uqrcode/uqrcode.js:34", "[uQRCode]: foregroundColor and backgroundColor cannot be the same!"), new b.Error("foregroundColor and backgroundColor cannot be the same!");
  var s = new e(t, i);
  s.addData(function(o3) {
    o3 = o3.toString();
    for (var e2, r2 = "", t2 = 0; t2 < o3.length; t2++)
      (e2 = o3.charCodeAt(t2)) >= 1 && e2 <= 127 ? r2 += o3.charAt(t2) : e2 > 2047 ? (r2 += String.fromCharCode(224 | e2 >> 12 & 15), r2 += String.fromCharCode(128 | e2 >> 6 & 63), r2 += String.fromCharCode(128 | e2 >> 0 & 63)) : (r2 += String.fromCharCode(192 | e2 >> 6 & 31), r2 += String.fromCharCode(128 | e2 >> 0 & 63));
    return r2;
  }(n)), s.make(), this.base = s, this.typeNumber = s.typeNumber, this.modules = s.modules, this.moduleCount = s.moduleCount, this.dynamicSize = u ? Math.ceil((a - 2 * d) / s.moduleCount) * s.moduleCount + 2 * d : a, function(o3) {
    let { dynamicSize: e2, margin: r2, backgroundColor: t2, backgroundPadding: i2, foregroundColor: n2, foregroundPadding: a2, modules: d2, moduleCount: u2 } = o3, s2 = (e2 - 2 * r2) / u2, g = s2, l = 0;
    i2 > 0 && (l = g * i2 / 2, g -= 2 * l);
    let h = s2, c = 0;
    a2 > 0 && (c = h * a2 / 2, h -= 2 * c);
    for (var m = 0; m < u2; m++)
      for (var f2 = 0; f2 < u2; f2++) {
        var v2 = f2 * s2 + r2, p2 = m * s2 + r2;
        if (d2[m][f2]) {
          var C2 = c, b2 = v2 + c, k = p2 + c, y = h, w = h;
          d2[m][f2] = { type: ["foreground"], color: n2, isBlack: true, isDrawn: false, destX: v2, destY: p2, destWidth: s2, destHeight: s2, x: b2, y: k, width: y, height: w, paddingTop: C2, paddingRight: C2, paddingBottom: C2, paddingLeft: C2 };
        } else
          C2 = l, b2 = v2 + l, k = p2 + l, y = g, w = g, d2[m][f2] = { type: ["background"], color: t2, isBlack: false, isDrawn: false, destX: v2, destY: p2, destWidth: s2, destHeight: s2, x: b2, y: k, width: y, height: w, paddingTop: C2, paddingRight: C2, paddingBottom: C2, paddingLeft: C2 };
      }
  }(this), function(o3) {
    let { modules: e2, moduleCount: r2, positionProbeBackgroundColor: t2, positionProbeForegroundColor: i2 } = o3, n2 = r2 - 7;
    [[0, 0, 1], [1, 0, 1], [2, 0, 1], [3, 0, 1], [4, 0, 1], [5, 0, 1], [6, 0, 1], [0, 1, 1], [1, 1, 0], [2, 1, 0], [3, 1, 0], [4, 1, 0], [5, 1, 0], [6, 1, 1], [0, 2, 1], [1, 2, 0], [2, 2, 1], [3, 2, 1], [4, 2, 1], [5, 2, 0], [6, 2, 1], [0, 3, 1], [1, 3, 0], [2, 3, 1], [3, 3, 1], [4, 3, 1], [5, 3, 0], [6, 3, 1], [0, 4, 1], [1, 4, 0], [2, 4, 1], [3, 4, 1], [4, 4, 1], [5, 4, 0], [6, 4, 1], [0, 5, 1], [1, 5, 0], [2, 5, 0], [3, 5, 0], [4, 5, 0], [5, 5, 0], [6, 5, 1], [0, 6, 1], [1, 6, 1], [2, 6, 1], [3, 6, 1], [4, 6, 1], [5, 6, 1], [6, 6, 1]].forEach((o4) => {
      var r3 = e2[o4[0]][o4[1]], a2 = e2[o4[0] + n2][o4[1]], d2 = e2[o4[0]][o4[1] + n2];
      d2.type.push("positionProbe"), a2.type.push("positionProbe"), r3.type.push("positionProbe"), r3.color = 1 == o4[2] ? i2 : t2, a2.color = 1 == o4[2] ? i2 : t2, d2.color = 1 == o4[2] ? i2 : t2;
    });
  }(this), function(o3) {
    let { modules: e2, moduleCount: r2, separatorColor: t2 } = o3;
    [[7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]].forEach((o4) => {
      var i2 = e2[o4[0]][o4[1]], n2 = e2[r2 - o4[0] - 1][o4[1]], a2 = e2[o4[0]][r2 - o4[1] - 1];
      a2.type.push("separator"), n2.type.push("separator"), i2.type.push("separator"), i2.color = t2, n2.color = t2, a2.color = t2;
    });
  }(this), function(o3) {
    let { typeNumber: e2, modules: r2, moduleCount: t2, foregroundColor: i2, backgroundColor: n2, positionAdjustForegroundColor: a2, positionAdjustBackgroundColor: d2, timingForegroundColor: u2, timingBackgroundColor: s2 } = o3;
    const g = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]][e2 - 1];
    if (g) {
      const o4 = [[-2, -2, 1], [-1, -2, 1], [0, -2, 1], [1, -2, 1], [2, -2, 1], [-2, -1, 1], [-1, -1, 0], [0, -1, 0], [1, -1, 0], [2, -1, 1], [-2, 0, 1], [-1, 0, 0], [0, 0, 1], [1, 0, 0], [2, 0, 1], [-2, 1, 1], [-1, 1, 0], [0, 1, 0], [1, 1, 0], [2, 1, 1], [-2, 2, 1], [-1, 2, 1], [0, 2, 1], [1, 2, 1], [2, 2, 1]], e3 = g.length;
      for (let l = 0; l < e3; l++)
        for (let h = 0; h < e3; h++) {
          let { x: e4, y: c } = { x: g[l], y: g[h] };
          e4 < 9 && c < 9 || e4 > t2 - 9 - 1 && c < 9 || c > t2 - 9 - 1 && e4 < 9 || o4.forEach((o5) => {
            var t3 = r2[e4 + o5[0]][c + o5[1]];
            t3.type.push("positionAdjust"), t3.type.includes("timing") ? 1 == o5[2] ? t3.color = a2 == i2 ? u2 : a2 : t3.color = a2 == i2 && d2 == n2 ? s2 : d2 : t3.color = 1 == o5[2] ? a2 : d2;
          });
        }
    }
  }(this), function(o3) {
    let { modules: e2, moduleCount: r2, timingForegroundColor: t2, timingBackgroundColor: i2 } = o3, n2 = r2 - 16;
    for (let o4 = 0; o4 < n2; o4++) {
      var a2 = e2[6][8 + o4], d2 = e2[8 + o4][6];
      a2.type.push("timing"), d2.type.push("timing"), a2.color = 1 & o4 ^ 1 ? t2 : i2, d2.color = 1 & o4 ^ 1 ? t2 : i2;
    }
  }(this), function(o3) {
    let { modules: e2, moduleCount: r2, darkBlockColor: t2 } = o3;
    var i2 = e2[r2 - 7 - 1][8];
    i2.type.push("darkBlock"), i2.color = t2;
  }(this), function(o3) {
    let { typeNumber: e2, modules: r2, moduleCount: t2, typeNumberBackgroundColor: i2, typeNumberForegroundColor: n2 } = o3;
    if (e2 < 7)
      return r2;
    const a2 = [0, 0, 0, 0, 0, 0, 0, "000111110010010100", "001000010110111100", "001001101010011001", "001010010011010011", "001011101111110110", "001100011101100010", "001101100001000111", "001110011000001101", "001111100100101000", "010000101101111000", "010001010001011101", "010010101000010111", "010011010100110010", "010100100110100110", "010101011010000011", "010110100011001001", "010111011111101100", "011000111011000100", "011001000111100001", "011010111110101011", "011011000010001110", "011100110000011010", "011101001100111111", "011110110101110101", "011111001001010000", "100000100111010101", "100001011011110000", "100010100010111010", "100011011110011111", "100100101100001011", "100101010000101110", "100110101001100100", "100111010101000001", "101000110001101001"];
    let d2 = a2[e2] + a2[e2], u2 = [t2 - 11, t2 - 10, t2 - 9];
    [[5, u2[2]], [5, u2[1]], [5, u2[0]], [4, u2[2]], [4, u2[1]], [4, u2[0]], [3, u2[2]], [3, u2[1]], [3, u2[0]], [2, u2[2]], [2, u2[1]], [2, u2[0]], [1, u2[2]], [1, u2[1]], [1, u2[0]], [0, u2[2]], [0, u2[1]], [0, u2[0]], [u2[2], 5], [u2[1], 5], [u2[0], 5], [u2[2], 4], [u2[1], 4], [u2[0], 4], [u2[2], 3], [u2[1], 3], [u2[0], 3], [u2[2], 2], [u2[1], 2], [u2[0], 2], [u2[2], 1], [u2[1], 1], [u2[0], 1], [u2[2], 0], [u2[1], 0], [u2[0], 0]].forEach((o4, e3) => {
      var t3 = r2[o4[0]][o4[1]];
      t3.type.push("typeNumber"), t3.color = "1" == d2[e3] ? n2 : i2;
    });
  }(this), this.isMaked = true, this.drawModules = [];
}, b.prototype.getDrawModules = function() {
  if (this.drawModules && this.drawModules.length > 0)
    return this.drawModules;
  let o2 = this.drawModules = [], { modules: e2, moduleCount: r, dynamicSize: t, areaColor: i, backgroundImageSrc: n, backgroundImageX: a, backgroundImageY: d, backgroundImageWidth: u, backgroundImageHeight: s, backgroundImageAlpha: g, backgroundImageBorderRadius: l, foregroundImageSrc: h, foregroundImageX: c, foregroundImageY: m, foregroundImageWidth: f2, foregroundImageHeight: v2, foregroundImagePadding: p2, foregroundImageBackgroundColor: C2, foregroundImageBorderRadius: b2, foregroundImageShadowOffsetX: k, foregroundImageShadowOffsetY: y, foregroundImageShadowBlur: w, foregroundImageShadowColor: I } = this;
  i && o2.push({ name: "area", type: "area", color: i, x: 0, y: 0, width: t, height: t }), n && o2.push({ name: "backgroundImage", type: "image", imageSrc: n, mappingName: "backgroundImageSrc", x: a, y: d, width: u, height: s, alpha: g, borderRadius: l });
  for (var B = 0; B < r; B++)
    for (var S = 0; S < r; S++) {
      var P = e2[B][S];
      P.isDrawn || (P.type.includes("foreground") ? o2.push({ name: "foreground", type: "tile", color: P.color, destX: P.destX, destY: P.destY, destWidth: P.destWidth, destHeight: P.destHeight, x: P.x, y: P.y, width: P.width, height: P.height, paddingTop: P.paddingTop, paddingRight: P.paddingRight, paddingBottom: P.paddingBottom, paddingLeft: P.paddingLeft, rowIndex: B, colIndex: S }) : o2.push({ name: "background", type: "tile", color: P.color, destX: P.destX, destY: P.destY, destWidth: P.destWidth, destHeight: P.destHeight, x: P.x, y: P.y, width: P.width, height: P.height, paddingTop: P.paddingTop, paddingRight: P.paddingRight, paddingBottom: P.paddingBottom, paddingLeft: P.paddingLeft, rowIndex: B, colIndex: S }), P.isDrawn = true);
    }
  return h && o2.push({ name: "foregroundImage", type: "image", imageSrc: h, mappingName: "foregroundImageSrc", x: c, y: m, width: f2, height: v2, padding: p2, backgroundColor: C2, borderRadius: b2, shadowOffsetX: k, shadowOffsetY: y, shadowBlur: w, shadowColor: I }), o2;
}, b.prototype.isBlack = function(o2, e2) {
  var r = this.moduleCount;
  return !(0 > o2 || 0 > e2 || o2 >= r || e2 >= r) && this.modules[o2][e2].isBlack;
}, b.prototype.drawCanvas = function() {
  let { isMaked: o2, canvasContext: e2, useDynamicSize: r, dynamicSize: t, foregroundColor: i, foregroundPadding: n, backgroundColor: a, backgroundPadding: d, drawReserve: u, margin: s } = this;
  if (!o2)
    return common_vendor.index.__f__("error", "at uni_modules/Sansnn-uQRCode/js_sdk/uqrcode/uqrcode.js:34", "[uQRCode]: please execute the make method first!"), Promise.reject(new b.Error("please execute the make method first!"));
  let g = this.getDrawModules(), l = (o3, r2) => __async(this, null, function* () {
    try {
      e2.clearRect(0, 0, t, t), e2.draw(false);
      for (var i2 = 0; i2 < g.length; i2++) {
        var n2 = g[i2];
        switch (e2.save(), n2.type) {
          case "area":
            e2.setFillStyle(n2.color), e2.fillRect(n2.x, n2.y, n2.width, n2.height);
            break;
          case "tile":
            var a2 = n2.x, d2 = n2.y, s2 = n2.width, l2 = n2.height;
            e2.setFillStyle(n2.color), e2.fillRect(a2, d2, s2, l2);
            break;
          case "image":
            if ("backgroundImage" === n2.name) {
              a2 = Math.round(n2.x), d2 = Math.round(n2.y), s2 = Math.round(n2.width), l2 = Math.round(n2.height);
              s2 < 2 * (c = Math.round(n2.borderRadius)) && (c = s2 / 2), l2 < 2 * c && (c = l2 / 2), e2.setGlobalAlpha(n2.alpha), c > 0 && (e2.beginPath(), e2.moveTo(a2 + c, d2), e2.arcTo(a2 + s2, d2, a2 + s2, d2 + l2, c), e2.arcTo(a2 + s2, d2 + l2, a2, d2 + l2, c), e2.arcTo(a2, d2 + l2, a2, d2, c), e2.arcTo(a2, d2, a2 + s2, d2, c), e2.closePath(), e2.setStrokeStyle("rgba(0,0,0,0)"), e2.stroke(), e2.clip());
              try {
                var h = yield this.loadImage(n2.imageSrc);
                e2.drawImage(h, a2, d2, s2, l2);
              } catch (o4) {
                throw common_vendor.index.__f__("error", "at uni_modules/Sansnn-uQRCode/js_sdk/uqrcode/uqrcode.js:34", `[uQRCode]: ${n2.mappingName} invalid!`), new b.Error(`${n2.mappingName} invalid!`);
              }
            } else if ("foregroundImage" === n2.name) {
              a2 = Math.round(n2.x), d2 = Math.round(n2.y), s2 = Math.round(n2.width), l2 = Math.round(n2.height);
              var c, m = Math.round(n2.padding);
              s2 < 2 * (c = Math.round(n2.borderRadius)) && (c = s2 / 2), l2 < 2 * c && (c = l2 / 2);
              var f2 = a2 - m, v2 = d2 - m, p2 = s2 + 2 * m, C2 = l2 + 2 * m, k = Math.round(p2 / s2 * c);
              p2 < 2 * k && (k = p2 / 2), C2 < 2 * k && (k = C2 / 2), e2.save(), e2.setShadow(n2.shadowOffsetX, n2.shadowOffsetY, n2.shadowBlur, n2.shadowColor), k > 0 ? (e2.beginPath(), e2.moveTo(f2 + k, v2), e2.arcTo(f2 + p2, v2, f2 + p2, v2 + C2, k), e2.arcTo(f2 + p2, v2 + C2, f2, v2 + C2, k), e2.arcTo(f2, v2 + C2, f2, v2, k), e2.arcTo(f2, v2, f2 + p2, v2, k), e2.closePath(), e2.setFillStyle(n2.backgroundColor), e2.fill()) : (e2.setFillStyle(n2.backgroundColor), e2.fillRect(f2, v2, p2, C2)), e2.restore(), e2.save(), k > 0 ? (e2.beginPath(), e2.moveTo(f2 + k, v2), e2.arcTo(f2 + p2, v2, f2 + p2, v2 + C2, k), e2.arcTo(f2 + p2, v2 + C2, f2, v2 + C2, k), e2.arcTo(f2, v2 + C2, f2, v2, k), e2.arcTo(f2, v2, f2 + p2, v2, k), e2.closePath(), e2.setFillStyle(m > 0 ? n2.backgroundColor : "rgba(0,0,0,0)"), e2.fill()) : (e2.setFillStyle(m > 0 ? n2.backgroundColor : "rgba(0,0,0,0)"), e2.fillRect(f2, v2, p2, C2)), e2.restore(), c > 0 && (e2.beginPath(), e2.moveTo(a2 + c, d2), e2.arcTo(a2 + s2, d2, a2 + s2, d2 + l2, c), e2.arcTo(a2 + s2, d2 + l2, a2, d2 + l2, c), e2.arcTo(a2, d2 + l2, a2, d2, c), e2.arcTo(a2, d2, a2 + s2, d2, c), e2.closePath(), e2.setStrokeStyle("rgba(0,0,0,0)"), e2.stroke(), e2.clip());
              try {
                h = yield this.loadImage(n2.imageSrc);
                e2.drawImage(h, a2, d2, s2, l2);
              } catch (o4) {
                throw common_vendor.index.__f__("error", "at uni_modules/Sansnn-uQRCode/js_sdk/uqrcode/uqrcode.js:34", `[uQRCode]: ${n2.mappingName} invalid!`), new b.Error(`${n2.mappingName} invalid!`);
              }
            }
        }
        u && e2.draw(true), e2.restore();
      }
      e2.draw(true), setTimeout(o3, 150);
    } catch (o4) {
      if (!(o4 instanceof b.Error))
        throw o4;
      r2(o4);
    }
  });
  return new Promise((o3, e3) => {
    l(o3, e3);
  });
}, b.prototype.draw = function() {
  return this.drawCanvas();
}, b.prototype.register = function(o2) {
  o2 && o2(b, this, true);
};
exports.b = b;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/uni_modules/Sansnn-uQRCode/js_sdk/uqrcode/uqrcode.js.map
