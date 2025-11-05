// #ifdef VUE3
import {
	onShow
} from '@dcloudio/uni-app'
import {
	onHide
} from '@dcloudio/uni-app'
// #endif

function implEvent(name) {
  let cbs = `_callbacks_${name}`
  return {
    [cbs]: [],
    [`on${name}`]: function(callback) {
      this[cbs].push(callback)
    },
    [`off${name}`]: function(callback) {
      this[cbs] = this[cbs].filter(cb => cb !== callback)
    },
    [`emit${name}`]: function(...args) {
      for (let cb of this[cbs]) {
        cb.call(null, ...args)
      }
    },
  }
}

const appEvent = {
  ...implEvent('AppActivate'),
  ...implEvent('AppDeactivate'),

  callbacks_KeyDown: [],
  onKeyDown(callback, { order = 0, match = {} } = {}) {
    this['callbacks_KeyDown'].push({
      callback,
      order,
      match,
    })
    this['callbacks_KeyDown'].sort((a, b) => a.order - b.order)
  },
  offKeyDown(callback) {
    this.callbacks_KeyDown = this.callbacks_KeyDown.filter(v => v.callback !== callback)
  },
  emitKeyDown(evt) {
    for (let v of this.callbacks_KeyDown) {
      let matched = Object.keys(v.match).reduce((matched, name) => {
        return matched && evt[name] === v.match[name]
      }, true)
      if (!matched) continue
      let res = v.callback.call(null, evt)
      if (res === true) break
    }
  },
}

// 监听应用生命周期
setTimeout(() => {
	// #ifdef APP
	// #ifdef VUE2
	getApp().$vm.$on('hook:onShow', function() {
		appEvent.emitAppActivate()
	})
	getApp().$vm.$on('hook:onHide', function() {
		appEvent.emitAppDeactivate()
	})
	// #endif

	// #ifdef VUE3
	onShow(function() {
		appEvent.emitAppActivate()
	}, getApp().$vm.$)
	onHide(function() {
		appEvent.emitAppDeactivate()
	}, getApp().$vm.$)
	// #endif
	// #endif

	// #ifdef H5
	window.addEventListener("focus", () => {
		appEvent.emitAppActivate()
	})
	window.addEventListener("blur", () => {
		appEvent.emitAppDeactivate()
	})
	window.addEventListener("keydown", (evt) => {
		appEvent.emitKeyDown(evt)
	})
	// #endif

	// #ifdef MP
	uni.onAppShow(function() {
		appEvent.emitAppActivate()
	})
	uni.onAppHide(function() {
		appEvent.emitAppDeactivate()
	})
	// #endif

}, 0)

export default appEvent
