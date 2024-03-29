/* eslint-disable */
const {
  camelCase,
  throttle
} = require('lodash')
const chokidar = require('chokidar')
const Glob = require('glob')
const pify = require('pify')
const path = require('path')
const fs = require('fs')
const glob = pify(Glob)
require('colors')

/**
 * 主函数，生成路由表和文件入口
 * @param {object} config 配置
 */
const generateRoutesAndFiles = async (config) => {
  // ** 匹配任意级别目录
  const files = await glob(`${config.viewPath || 'views'}/**/*.{vue,js}`, {
    // cwd: path.resolve(process.cwd(), './'),
    ignore: ['**/*.test.*', '**/*.spec.*', '**/-*.*', '**/#*.*']
  })
  // 这里将文件名中带有"、'的替换为$
  files.map(f => f.replace(/('|")/g, '\\$1'))
  return createRoutes(files, config.viewPath || 'views', '-')
}

/**
 * 
 * @param {*} files 文件名数组
 * @param {*} viewsDir views的目录
 * @param {*} routeNameSplitter 路由分割符
 */
const createRoutes = (files, viewsDir = '', routeNameSplitter = '-') => {
  const supportedExtensions = ['vue', 'js']
  const routes = []
  const requireComponent = []
  files.forEach((file) => {
    // keys 拿到每一级目录和文件名（不包括后缀）
    const keys = file
      // 去掉viewsDir前缀
      .replace(new RegExp(`^${viewsDir}`), '')
      // 去掉扩展后缀.js或.vue
      .replace(new RegExp(`\\.(${supportedExtensions.join('|')})$`), '')
      .replace(/\/{2,}/g, '/')
      .split('/')
      .slice(1)

    // 单个路由结构
    const route = {
      name: '',
      path: '',
      // 这里生成的component为用-连接的，比如 kol-index。最后转为驼峰kolIndex
      component: `${camelCase(keys.join('-').replace('_', ''))}`
    }
    // 引入组件的字符串
    requireComponent.push(`const ${route.component} = () => import(/* webpackChunkName: "${route.component}" */ '@/views/${keys.join('/')}')`)
    let parent = routes
    // keys 约为 ['kol', 'index']
    keys.forEach((key, i) => {
      // remove underscore only, if its the prefix
      // 去掉开头的下划线
      const sanitizedKey = key.startsWith('_') ? key.substr(1) : key

      route.name = route.name ?
        route.name + routeNameSplitter + sanitizedKey :
        sanitizedKey
      // 如果文件名为 - 的话，则会生成一个 * 的路由
      route.name += key === '_' ? 'all' : ''
      // route.chunkName = file.replace(new RegExp(`\\.(${supportedExtensions.join('|')})$`), '')
      const child = parent.find(parentRoute => parentRoute.name === route.name)

      if (child) {
        child.children = child.children || []
        parent = child.children
        route.path = ''
        // 这里判断如果结尾是index的话，则路径为空。path不会带有index
      } else if (key === 'index' && i + 1 === keys.length) {
        route.path += i > 0 ? '' : '/'
      } else {
        route.path += '/' + getRoutePathExtension(key)

        if (key.startsWith('_') && key.length > 1) {
          route.path += '?'
        }
      }
    })
    parent.push(route)
  })
  sortRoutes(routes)
  return {
    routes: cleanChildrenRoutes(routes),
    requireComponent
  }
}
const startsWithAlias = aliasArray => str => aliasArray.some(c => str.startsWith(c))
const startsWithSrcAlias = startsWithAlias(['@', '~'])
const r = (...args) => {
  const lastArg = args[args.length - 1]
  if (startsWithSrcAlias(lastArg)) {
    return wp(lastArg)
  }
  return wp(path.resolve(...args.map(str => str.replace(/\//g, escapeRegExp(path.sep)))))
}

const baseToString = value => {
  if (typeof value == 'string') {
    return value
  }
  if (isArray_1(value)) {
    return _arrayMap(value, baseToString) + ''
  }
  if (isSymbol_1(value)) {
    return symbolToString ? symbolToString.call(value) : ''
  }
  let result = (value + '')
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result
}

const toString = value => {
  return value == null ? '' : baseToString(value)
}

const escapeRegExp = string => {
  const reRegExpChar = /[\\^$.*+?()[\]{}|]/g,
    reHasRegExpChar = RegExp(reRegExpChar.source)
  string = toString(string)
  return (string && reHasRegExpChar.test(string)) ?
    string.replace(reRegExpChar, '\\$&') :
    string
}
const isWindows = /^win/.test(process.platform)
const wp = (p = '') => {
  // windows 的特殊处理
  if (isWindows) {
    return p.replace(/\\/g, '\\\\')
  }
  return p
}
const getRoutePathExtension = (key) => {
  // 如果key 为 - 的话，则会生成一个 * 的路由
  if (key === '_') {
    return '*'
  }
  // 如果key 为 _ 开始的话，则会生成一个 :key 的路由
  if (key.startsWith('_')) {
    return `:${key.substr(1)}`
  }
  return key
}

const DYNAMIC_ROUTE_REGEX = /^\/(:|\*)/

// 这个函数是对routes数组进行一些默认规则的排序
const sortRoutes = routes => {
  routes.sort((a, b) => {
    if (!a.path.length) {
      return -1
    }
    if (!b.path.length) {
      return 1
    }
    // Order: /static, /index, /:dynamic
    // Match exact route before index: /login before /index/_slug
    if (a.path === '/') {
      return DYNAMIC_ROUTE_REGEX.test(b.path) ? -1 : 1
    }
    if (b.path === '/') {
      return DYNAMIC_ROUTE_REGEX.test(a.path) ? 1 : -1
    }

    let i
    let res = 0
    let y = 0
    let z = 0
    const _a = a.path.split('/')
    const _b = b.path.split('/')
    for (i = 0; i < _a.length; i++) {
      if (res !== 0) {
        break
      }
      y = _a[i] === '*' ? 2 : _a[i].includes(':') ? 1 : 0
      z = _b[i] === '*' ? 2 : _b[i].includes(':') ? 1 : 0
      res = y - z
      // If a.length >= b.length
      if (i === _b.length - 1 && res === 0) {
        // unless * found sort by level, then alphabetically
        res = _a[i] === '*' ? -1 : (
          _a.length === _b.length ? a.path.localeCompare(b.path) : (_a.length - _b.length)
        )
      }
    }

    if (res === 0) {
      // unless * found sort by level, then alphabetically
      res = _a[i - 1] === '*' && _b[i] ? 1 : (
        _a.length === _b.length ? a.path.localeCompare(b.path) : (_a.length - _b.length)
      )
    }
    return res
  })

  routes.forEach((route) => {
    if (route.children) {
      sortRoutes(route.children)
    }
  })

  return routes
}

const cleanChildrenRoutes = (routes, isChild = false, routeNameSplitter = '-') => {
  let start = -1
  const regExpIndex = new RegExp(`${routeNameSplitter}index$`)
  const routesIndex = []
  routes.forEach((route) => {
    if (regExpIndex.test(route.name) || route.name === 'index') {
      // Save indexOf 'index' key in name
      const res = route.name.split(routeNameSplitter)
      const s = res.indexOf('index')
      start = start === -1 || s < start ? s : start
      routesIndex.push(res)
    }
  })
  routes.forEach((route) => {
    route.path = isChild ? route.path.replace('/', '') : route.path
    if (route.path.includes('?')) {
      const names = route.name.split(routeNameSplitter)
      const paths = route.path.split('/')
      if (!isChild) {
        paths.shift()
      } // clean first / for parents
      routesIndex.forEach((r) => {
        const i = r.indexOf('index') - start //  children names
        if (i < paths.length) {
          for (let a = 0; a <= i; a++) {
            if (a === i) {
              paths[a] = paths[a].replace('?', '')
            }
            if (a < i && names[a] !== r[a]) {
              break
            }
          }
        }
      })
      route.path = (isChild ? '' : '/') + paths.join('/')
    }
    route.name = route.name.replace(regExpIndex, '')
    if (route.children) {
      if (route.children.find(child => child.path === '')) {
        delete route.name
      }
      route.children = cleanChildrenRoutes(route.children, true, routeNameSplitter)
    }
  })
  return routes
}

const creatRouter = (config) => {
  const { srcPath } = config
  generateRoutesAndFiles(config).then(res => {
    // add eslint disable for building lint
    let string = '/* eslint-disable */\n'
    res.requireComponent.forEach(res => {
      string += `${res}\n`
    })
    string += `export default ${JSON.stringify(res.routes, null, 2)}`
      .replace(/"component": "(\w+?)"/g, `"component": $1`)
      .replace(/"(\w+?)":/g, '$1:').replace(/"/g, '\'')
    fs.writeFile(path.resolve(process.cwd(), `${srcPath || './src'}/router/routes.js`), `${string}\n`, () => {
      console.log('\n路由表已重新生成.'.green)
    })
  })
}
class RouterWebpackPlugin {
  constructor(config) {
    this.config = config
  }
  apply(compiler) {
    const _creatRouter = throttle(() => {
      creatRouter(this.config)
    }, 500)
    const { viewPath } = this.config
    compiler
      .hooks
      .entryOption
      .tap('RouterWebpackPlugin', () => {
        _creatRouter()
      })
    compiler
      .hooks
      .environment
      .tap('RouterWebpackPlugin', () => {
        compiler.options.mode === 'development' && chokidar.watch(viewPath || 'views', {
          ignoreInitial: true,
          // cwd: path.resolve(process.cwd(), srcPath || './src'),
          ignore: ['**/*.test.*', '**/*.spec.*', '**/-*.*', '**/#*.*']
        }).on('add', () => {
          _creatRouter()
        }).on('addDir', () => {
          _creatRouter()
        }).on('unlink', () => {
          _creatRouter()
        }).on('unlinkDir', () => {
          _creatRouter()
        })
      })
  }
}

module.exports = RouterWebpackPlugin
