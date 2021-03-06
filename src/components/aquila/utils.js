import * as blob from 'blob-util'
import stringhash from 'string-hash'
var _ = require('lodash')

// base64
const Base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const Base64Lookup = new Uint8Array(256)
for (let i = 0; i < Base64Chars.length; i++) {
  Base64Lookup[Base64Chars.charCodeAt(i)] = i
}

const utils = {
  lodash: _,
  common: {
    /**
     * 判断变量类型是否是字符串
     */
    isString: function (val) {
      return typeof val === 'string'
    },

    /**
     * 判断变量类型是否是布尔值
     */
    isBoolean: function (val) {
      return typeof val === 'boolean'
    },

    /**
     * 判断变量类型是否是数值
     */
    isNumber: function (val) {
      return typeof val === 'number'
    },

    /**
     * 改进typeof
     */
    typeOf: function (value) {
      let s = typeof value
      if (s === 'object') {
        if (value) {
          if (value instanceof Array) {
            return 'array'
          } else if (value instanceof Object) {
            return s
          }

          let className = Object.prototype.toString.call(/** @type {!Object} */ (value))
          if (className === '[object Window]') {
            return 'object'
          }

          // 判断是否为数组类型
          if (className === '[object Array]' ||
            (typeof value.length === 'number' &&
            typeof value.splice !== 'undefined' &&
            typeof value.propertyIsEnumerable !== 'undefined' &&
            !value.propertyIsEnumerable('splice'))) {
            return 'array'
          }

          // 判断是否为函数类型
          if (className === '[object Function]' ||
            (typeof value.call !== 'undefined' &&
            typeof value.propertyIsEnumerable !== 'undefined' &&
            !value.propertyIsEnumerable('call'))) {
            return 'function'
          }
        } else {
          return 'null'
        }
      } else if (s === 'function' && typeof value.call === 'undefined') {
        return 'object'
      }
      return s
    },
    /**
     * 判断是否为空
     */
    isNull: function (val) {
      return val == null
    },

    /**
     * 判断是否非空
     */
    isDefAndNotNull: function (val) {
      return val != null
    },

    /**
     * 判断是否为数组
     */
    isArray: function (val) {
      return utils.common.typeOf(val) === 'array'
    },

    /**
     * 判断是否为类数组
     */
    isArrayLike: function (val) {
      var type = utils.common.typeOf(val)
      return type === 'array' || (type === 'object' && typeof val.length === 'number')
    },

    /**
     * 判断是否为函数
     */
    isFunction: function (val) {
      return utils.common.typeOf(val) === 'function'
    },

    /**
     * 判断是否为对象
     */
    isObject: function (val) {
      var type = typeof val
      return (type === 'object' && val != null) || type === 'function'
    },

    /**
     * 字符串转Buffer
     */
    string2ArrayBuffer: function (binaryString) {
      return blob.binaryStringToArrayBuffer(binaryString)
    },

    /**
     * 字符串Trim
     * @param {*} str
     */
    trimString (str) {
      return _.trim(str)
    },

    /**
     * 字符串hash
     * @param {*} str string 不能为空或空格
     */
    hashString (str) {
      if (!utils.common.isString(str)) {
        return null
      }
      let trim = utils.common.trimString(str)
      if (trim.length === 0) {
        return null
      }
      return stringhash(trim)
    },

    /**
     * 深度拷贝
     */
    clone (obj) {
      return _.cloneDeep(obj)
    },

    /**
     * 时间戳
     */
    currentDateString (time = false) {
      let date = new Date()
      let t = [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
      ]

      if (time) {
        t = t.concat([
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
          date.getMilliseconds()
        ])
      }
      return t.join('-')
    },

    /**
    * 合并对象(浅拷贝)
    * @param target
    * @param src
    * @returns {*}
    */
    extend (target, ...src) {
      if (typeof Object.assign === 'function') {
        Object.assign(target, ...src)
      } else {
        const first = src.shift()
        // 覆盖旧值
        for (const key in first) {
          target[key] = first[key]
        }
        if (src.length) {
          utils.common.extend(target, ...src)
        }
      }
      return target
    },

    /**
    * 定义属性
    * @param obj
    * @param key
    * @param val
    * @param enumerable
    */
    def (obj, key, val, enumerable) {
      Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
      })
    },

    /**
    *
    * @param arr
    * @param item
    * @returns {*|Array.<T>}
    */
    removeArray (arr, item) {
      if (arr.length) {
        const index = arr.indexOf(item)
        if (index > -1) {
          return arr.splice(index, 1)
        }
      }
    }
  },
  base64: {
    encodeBuffer: function (arraybuffer) {
      let bytes = new Uint8Array(arraybuffer)
      let len = bytes.length
      let base64 = ''

      for (let i = 0; i < len; i += 3) {
        base64 += Base64Chars[bytes[i] >> 2]
        base64 += Base64Chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)]
        base64 += Base64Chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)]
        base64 += Base64Chars[bytes[i + 2] & 63]
      }

      if ((len % 3) === 2) {
        base64 = base64.substring(0, base64.length - 1) + '='
      } else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + '=='
      }

      return base64
    },
    decodeBuffer: function (base64) {
      let bufferLength = base64.length * 0.75
      let len = base64.length

      if (base64[base64.length - 1] === '=') {
        bufferLength--
        if (base64[base64.length - 2] === '=') {
          bufferLength--
        }
      }

      let arraybuffer = new ArrayBuffer(bufferLength)
      let bytes = new Uint8Array(arraybuffer)

      let encoded1, encoded2, encoded3, encoded4
      for (let i = 0, p = 0; i < len; i += 4) {
        encoded1 = Base64Lookup[base64.charCodeAt(i)]
        encoded2 = Base64Lookup[base64.charCodeAt(i + 1)]
        encoded3 = Base64Lookup[base64.charCodeAt(i + 2)]
        encoded4 = Base64Lookup[base64.charCodeAt(i + 3)]

        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4)
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2)
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63)
      }

      return arraybuffer
    }
  }
}

export default utils
