const PLUGIN_NAME = 'rollup-plugin-uniapp-cementing';
const CEMENTING_MODULE = '_uni_cementing_component.vue'

import fs from 'fs';
import path from 'path';
const SEP = '****************************************************************'
const DEBUG_FILE = 'debug.log'

let logReset = function() {
  fs.writeFileSync(
    path.join(__dirname, DEBUG_FILE),
    `${SEP}\n*  ${new Date().toLocaleString()}\n${SEP}\n`
  )
}

let logTitle = function(title) {
  let msg = `${SEP}\n*  ${title}\n${SEP}`
  log(msg)
}

let log = function(...args) {
  let msgs = []
  for (let msg of args) {
    if (typeof msg === 'string') {
      msgs.push(msg)
    } else {
      msgs.push(JSON.stringify(msg, null, 2))
    }
  }
  fs.writeFileSync(
    path.join(__dirname, DEBUG_FILE),
    `${msgs.join(' ')}\n`, {
      flag: 'a'
    }
  )
}

import { createFilter } from '@rollup/pluginutils';
import MagicString from 'magic-string';
import { walk } from 'estree-walker';

function walkTo(node, matchers = []) {
  let cur = node
  let matcher = matchers.shift()
  while (matcher) {
    let found
    walk(cur, {
      enter: function(node, parent, prop, index) {
        if (found) return
        if (typeof matcher == 'function' && matcher(node) || matcher === node.type) {
          found = node
        }
      }
    })
    if (!found) return
    cur = found
    if (matchers.length == 0) return cur
    matcher = matchers.shift()
  }
}

function cementingPlugin(options = {}) {
  const {
    platforms = [/^mp(\-.*)?$/],
    include = ['*.vue', '*.nvue'],
    exclude,
    resolve = __dirname,
    debug,
    components = {}
  } = options

  let enabled = false
  for (let platform of platforms) {
    if (platform instanceof RegExp) {
      if (platform.exec(process.env['UNI_PLATFORM'])) {
        enabled = true
      }
    } else if (platform === process.env['UNI_PLATFORM']) {
      enabled = true
    }
  }
  if (!enabled) return false
  if (!debug) {
    logReset = logTitle = log = () => {}
  }

  let filter = createFilter(include, exclude, { resolve })

  return {
    name: PLUGIN_NAME,
    enforce: 'pre',

    buildStart(options) {
      logReset()
      // log(options)
    },

    // 对使用了动态组件 <component> 的组件进行静态化处理。
    transform(code, id) {
      if (!filter(id)) return
      logTitle('transform: ' + id)

      // 检查组件代码是否使用了动态组件
      let re = /(<component)(.*?)(\/>|<\/component>)/sg
      let m = re.exec(code)
      if (!m) return
      // log('使用了动态组件的代码:', code)

      // 把 <template> 部分里面的 <component :is="xxx" ...> 替换成 <CementingXxx v-if="$isCementing(xxx, 'xxx')" ...>
      let usedCmps = {}
      code = code.replace(re, (match, p1, p2, p3) => {
        let cementingName = ''
        p2 = p2.replace(/cementing="(.*?)"/, (_, name) => {
          cementingName = name
          return ''
        })
        if (!cementingName) {
          log('<component> 组件缺少 cementing 属性，无法静态化：', id)
          return ''
        }
        let cmps = components[cementingName]
        if (!cmps) {
          log('cementing 属性无效：', id)
          return ''
        }

        let replace = Object.keys(cmps).map(cmpName => {
          usedCmps[`${cementingName}_${cmpName}`] = cmps[cmpName]
          let r1 = p1.replace('component', `${cementingName}_${cmpName}`)
          let r2 = p2.replace(/:is="(.*?)"/, (_, cond) => {
            return `v-if="$isCementing(${cond},'${cmpName}')"`
          })
          let r3 = p3.replace('component', `${cementingName}_${cmpName}`)
          return r1 + r2 + r3
        }).join('\n')

        // log('<<<<----')
        // log(match)
        // log('--------')
        // log(replace)
        // log('---->>>>')
        return replace
      })

      // 在 <script> 部分添加相关代码
      code = code.replace(/(<script.*?>)(.*?)(<\/script>)/sg, (match, p1, p2, p3) => {
        let magicString = new MagicString(p2)

        // 在代码顶部添加 import
        let imports = []
        for (let name of Object.keys(usedCmps)) {
          let source = usedCmps[name]
          imports.push(`import ${name} from '${source}';`)
        }
        magicString.appendLeft(0, `\n${imports.join('\n')}\n`)

        // 通过 AST 找到组件的 components 属性并在其中添加注册
        let ast = this.parse(p2)
        let exportDefaultObj = walkTo(ast, [
          'ExportDefaultDeclaration',
          'ObjectExpression',
        ])
        if (!exportDefaultObj) return match
        let componentsObj = walkTo(exportDefaultObj, [
          (node) => node.type === 'Property' && node.key.name === 'components',
          'ObjectExpression',
        ])

        let usedNames = Object.keys(usedCmps)
        if (usedNames.length > 0) {
          if (componentsObj) {
            // 如果组件已经定义了 components 属性，则在其中添加
            magicString.appendRight(componentsObj.start + 1, `\n${usedNames.join(',\n')},\n`)
          } else {
            // 如果组件没有定义 components 属性，则添加新定义
            magicString.appendRight(exportDefaultObj.start + 1, `components:{\n${usedNames.join(',\n')}\n},`)
          }
        }

        // 通过 AST 找到组件的 methods 属性并在其中添加 $isCementing() 方法
        let methodsObj = walkTo(exportDefaultObj, [
          (node) => node.type === 'Property' && node.key.name === 'methods',
          'ObjectExpression',
        ])

        let fn =
`$isCementing(is, name) {
  if (is.name) is = is.name
  return name == is?.replace?.(/-(.?)/g, (match, c) => c.toUpperCase()).replace('-', '')
}`
        if (methodsObj) {
          // 如果组件已经定义了 methods 属性，则在其中添加
          magicString.appendRight(methodsObj.start + 1, `\n${fn},\n`)
        } else {
          // 如果组件没有定义 methods 属性，则添加新定义
          magicString.appendRight(exportDefaultObj.start + 1, `methods:{\n${fn}\n},`)
        }
        p2 = magicString.toString()
        // let map = magicString.generateMap({ hires: true })

        let replace = p1 + p2 + p3
        // log('<<<<----')
        // log(match)
        // log('--------')
        // log(replace)
        // log('---->>>>')
        return replace
      })
      log('静态化之后的代码:', code)

      return { code }
    },

    // writeBundle(options, bundle) {
    //   logTitle('writeBundle:')
    //   log('bundle:', bundle)
    // },
  }
}

export default cementingPlugin