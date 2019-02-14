import logger from './logger'
import Utils from './utils'

/**
 * 行为状态
 */
const BehaviorStatus = {
  Idle: -1,
  Failure: 0,
  Success: 1,
  Running: 2
}

class Behavior {
  /**
   * 
   * @param {*} parent 父节点
   * @param {*} config 配置信息
   * @param {*} context 上下文
   */
  constructor (parent, config, context) {
    this.parent = parent
    this.status = BehaviorStatus.Idle
    if (!config) {
      logger.error('Behavior::constructor error -- config is null')
      return
    }

    this.config = config
    this.context = context
    // 关联函数
    this.convert(context, config)

    // 构建decorator
    this.decorators = []
    this.services = []
    if (config.elements) {
      for (let elem of config.elements) {
        if (elem.type === 'decorator') {
          this.decorators.push(new Decorator(this, elem, context))
        } else if (elem.type === 'service') {
          this.services.push(new Service(this, elem, context))
        }
      }
    }

    // 构建子节点
    this.children = []
    if (config.children) {
      for (let child of config.children) {
        if (child.type === 'task') {
          this.children.push(new Task(this, child, context))
        } else {
          this.children.push(new Composite(this, child, context))
        }
      }
    }
  }

  /**
   * 更新状态
   * @param {*} delta
   * @return 默认返回Success 
   */
  update (delta) {
    logger.debug(`Execute Behavior -- ${this.config.label}`)

    // 判断decorator是否满足
    for (let dec of this.decorators) {
      if (dec.update(delta) !== BehaviorStatus.Success) {
        return BehaviorStatus.Failure
      }
    }

    // 执行Service
    for (let ser of this.services) {
      ser.update(delta)
    }

    return BehaviorStatus.Success
  }

  /**
   * 重置状态
   */
  reset () {
    this.status = BehaviorStatus.Idle
    for (let dec of this.decorators) {
      dec.reset()
    }
    for (let ser of this.services) {
      ser.reset()
    }
    for (let child of this.children) {
      child.reset()
    }
  }

  /**
   * 
   * @param {*} config 
   * @param {*} context 
   */
  convert (context, config) {
    this.__func__ = null

    if (!context) {
      logger.error(`Behavior::bind failed -- [${config.label}] context is null`)
      return
    }

    if (!config.actor) {
      return
    }

    let f = null
    let actor = {}
    if (Utils.common.isString(config.actor)) {
      actor = {
        id: config.actor
      }
    } else if (Utils.common.isObject(config.actor) && Utils.common.isString(config.actor.id)) {
      actor = config.actor
    } else {
      logger.error(`Behavior::bind failed -- [${config.label}] config.actor is invalid`)
      return
    }

    if (config.type === 'decorator') {
      f = context.$decorators[actor.id]
    } else if (config.type === 'service') {
      f = context.$services[actor.id]
    } else if (config.type === 'task') {
      f = context.$tasks[actor.id]
    } else {
      return
    }

    this.__func__ = f.bind(context.$blackboard.getData())
  }
}

class Decorator extends Behavior {
  constructor (parent, config, context) {
    super(parent, config, context)
  }

  update (delta) {
    logger.debug(`Execute Decorator -- ${this.config.label}`)
    
    let res = true
    if (this.__func__) {
      let argus = [delta].concat(this.config.actor.params ? this.config.actor.params : [])
      res = this.__func__.apply(null, argus)
    }
    if (this.config.invert === true) {
      res = !res
    }

    this.context.log({
      type: 'decorator',
      node: this.config.label,
      action: 'judge',
      result: res
    })

    return res ? BehaviorStatus.Success : BehaviorStatus.Failure
  }
}

class Service extends Behavior {
  constructor (parent, config, context) {
    super(parent, config, context)
  }

  update (delta) {
    logger.debug(`Execute Service -- ${this.config.label}`)

    if (this.__func__) {
      let argus = [delta].concat(this.config.actor.params ? this.config.actor.params : [])
      this.__func__.apply(null, argus)
    }

    this.context.log({
      type: 'service',
      node: this.config.label,
      action: 'execute'
    })
  }
}

class Composite extends Behavior {
  constructor (parent, config, context) {
    super(parent, config, context)
    this.isComposite = true
    this.lastRunning = -1 // 上一次running的索引
    this.__cache__ = [] // children执行状态Cacha（用于Parallel）
  }

  update (delta) {
    let res = super.update(delta)
    if (res !== BehaviorStatus.Success) {
      return res
    }
    if (this.children.length > 0) { 
      if (this.config.type === 'selector') {
        res = this.updateSelector(delta)
      } else if (this.config.type === 'sequence') {
        res = this.updateSequence(delta)
      } else if (this.config.type === 'parallel') {
        res = this.updateParallel(delta)
      } else { // 未知类型
        res = BehaviorStatus.Error
      }
    }
   
    return res
  }

  updateSelector (delta) {
    let res = BehaviorStatus.Success
    // 执行子节点
    let i = this.lastRunning >= 0 ? this.lastRunning : 0
    this.lastRunning = -1

    for (;i < this.children.length; i++) {
      res = this.children[i].update(delta)
      console.log(i, res)
      if (res === BehaviorStatus.Failure) {
        continue
      } else if (res === BehaviorStatus.Success) {
        break
      } else if (res === BehaviorStatus.Running) {
        this.lastRunning = i
        break
      }
    }
    return res
  }

  updateSequence (delta) {
    let res = BehaviorStatus.Success
    // 执行子节点
    let i = this.lastRunning >= 0 ? this.lastRunning : 0
    this.lastRunning = -1
    for (i = this.lastRunning; i < this.children.length; i++) {
      res = this.children[i].update(delta)
      if (res === BehaviorStatus.Failure) {
        break
      } else if (res === BehaviorStatus.Success) {
        continue
      } else if (res === BehaviorStatus.Running) {
        this.lastRunning = i
        break
      }
    }
    return res
  }

  /**
   * 同时执行，根据
   * @param {*} delta 
   */
  updateParallel (delta) {
    let res = BehaviorStatus.Success
    // -1 全部成功 0 全部失败  XXX 指定数目
    let threshold = this.config.threshold ? Number(this.config.threshold) : -1
    if (threshold < 0) {
      threshold = this.children.length
    }
    threshold = Utils.lodash.clamp(threshold, 0, this.children.length)
   
    // 执行子节点
    let success = 0
    let running = 0
    for (let i = 0; i < this.children.length; i++) {
      if (this.__cache__[i] == null || this.__cache__[i] === BehaviorStatus.Running) {
        res = this.children[i].update(delta)
        this.__cache__[i] = res
        if (res === BehaviorStatus.Running) {
          running++
        }
      }

      if (this.__cache__[i] === BehaviorStatus.Success) {
        success++
      }
    }

    if (running === 0) {
      res = (success === threshold) ? BehaviorStatus.Success : BehaviorStatus.Failure
    } else {
      res = BehaviorStatus.Running
    }

    return res
  }

  reset () {
    super.reset()
    this.lastRunning = -1
    this.__cache__ = []
  }
}

class Task extends Behavior {
  constructor (parent, config, context) {
    super(parent, config, context)
  }

  update (delta) {
    logger.debug(`Execute Task -- ${this.config.label}`)
    let res = super.update(delta)
    if (res !== BehaviorStatus.Success) {
      return res
    }

    res = BehaviorStatus.Success
    if (this.__func__) {
      let argus = [delta].concat(this.config.actor.params ? this.config.actor.params : [])
      res = this.__func__.apply(null, argus)
    }

    this.context.log({
      type: 'task',
      node: this.config.label,
      action: 'execute'
    })

    return res
  }
}

export {
  BehaviorStatus,
  Behavior,
  Decorator,
  Service,
  Composite,
  Task
}
