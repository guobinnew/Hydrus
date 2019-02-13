import logger from './logger'
import Utils from './utils'

class BlackBoard {
  /**
   * 
   * @param data Object 必须是对象类型 
   */
  constructor (data) {
    this.data = data
    Utils.common.def(data, '__board__', this)
    this.walk(data)
  }

  /**
   * 遍历对象属性，将属性转换为get/set(只能用于对象)
   * @param obj
   */
  walk (obj) {
    for (const key in obj) {
      this.register(key, obj[key])
    }
  }

  register (key, val) {
    const obj = this.data

    // 获取属性的元信息，跳过不可修改的属性
    const property = Object.getOwnPropertyDescriptor(obj, key)
    if (property && property.configurable === false) {
      return
    }

    // 获取属性当前的get和set函数
    const getter = property && property.get
    const setter = property && property.set
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function boardGetter () {
        logger.debug(`### Aquila ### BlackBoard Getter ${key}`)
        const value = getter ? getter.call(obj) : val
        return value
      },
      set: function boardSetter (newVal) {
        logger.debug(`### Aquila ### BlackBoard Setter ${key}`)
        const value = getter ? getter.call(obj) : val
        if (newVal === value) {
          return
        }

        if (setter) {
          setter.call(obj, newVal)
        } else {
          val = newVal
        }
      }
    })
  }

  /**
   * 根数据
   */
  getData () {
    return this.data
  }

  /**
   * 是否包含属性
   * @param {*} key 
   */
  has (key) {
    const obj = this.data
    return Object.prototype.hasOwnProperty.call(obj, key)
  }
  
}

export default BlackBoard
