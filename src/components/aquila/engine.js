import { BehaviorStatus, Composite, Task } from './behavior'
import Blackboard from './blackboard'
import Utils from './utils'
import logger from './logger'

class BTEngine {
  constructor (data) {
    // 绑定数据
    this.$blackboard = new Blackboard(data.data)
    this.$decorators = data.decorators ? data.decorators : {}
    this.$services = data.services ? data.services : {}
    this.$tasks = data.tasks ? data.tasks : {}
    this.timestamp = null
    this.life = 0
    this.ticks = 0
    this.logs = []
  }

  /**
   * 加载tree模型
   * @param {*} tree 
   */
  load (tree) {
    if (!tree || !tree.root) {
      logger.error('BTEngine::load failed -- tree is invalid')
      return
    }

    // 创建根节点
    if (tree.root.type === 'task') {
      this.root = new Task(null, tree.root, this)
    } else {
      this.root = new Composite(null, tree.root, this)
    }
  }

  /**
   * 更新状态
   * @param {*} delta 上一次tick时间间隔
   */
  tick (delta) {
    if (!this.root) {
      logger.error('BTEngine::tick failed -- root is null')
      return
    }

    if (!this.timestamp) {
      this.timestamp = Utils.lodash.now()
      this.life = 0
      this.ticks = 0
    }

    if (delta == null) {
      let n = Utils.lodash.now()
      delta = n - this.timestamp
      this.timestamp = n
    }
    this.life += delta
    this.ticks += 1
    this.root.update(delta)
    // 打印日志
    if (Utils.common.isFunction(this.$log)) {
      this.$log.call(null, {
        timestamp: this.life,
        index: this.ticks,
        delta: delta,
        logs: this.logs
      })
    }
    this.logs = []
  }

  /**
   * 
   * @param {*} callback 
   */
  setLog (callback) {
    this.$log = callback
  }

  /**
   * 
   * @param {*} msg 
   */
  log (msg) {
    this.logs.push(msg)
  }

  /**
   * 重置行为树状态
   */
  reset () {
    if (!this.root) {
      logger.error('BTEngine::reset failed -- root is null')
      return
    }
    this.timestamp = null
    this.ticks = 0
    this.life = 0
    this.root.reset()
  }
}

BTEngine.Status = BehaviorStatus

export default BTEngine
