import Aquila from 'orion-aquila'
import Konva from 'konva'
import Utils from './node-utils'
import BTEntityNode from './node-entity'
import BTRootNode from './node-root'
import BTSelectorNode from './node-composite-selector'
import BTSequenceNode from './node-composite-sequence'
import BTParallelNode from './node-composite-parallel'
import BTTaskNode from './node-task'

/**
 * 编辑面板
 */
class BTStage {
  constructor (options) {
    this.options = {
      draggable: true,
      canZoom: true,
      canWheelZoom: true,
      readonly: false,
      debug: false,
      events: {}
    }
    Aquila.Utils.lodash.merge(this.options, options)
    this.stage = new Konva.Stage(this.options)
    this.stage.setAttr('@stage', this)

    this.root = null

    this.layers = {}
    // 创建图层
    this.layers.model = new Konva.Layer()
    this.stage.add(this.layers.model)
    // 拖放层
    this.layers.drag = new Konva.Layer()
    this.stage.add(this.layers.drag)

    // 当前拖放的节点
    this.isDraging = false
    this.dragMarker = new Konva.Group({
      name: 'dragmarker',
      draggable: true,
      visible: false
    })
    this.layers.drag.add(this.dragMarker)
    this.dropMarker = new Konva.Rect({
      name: 'dropmarker',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      fill: Utils.zone.highlight,
      visible: false
    })
    this.layers.drag.add(this.dropMarker)

    // 是否被修改
    this.modified = false

    // 当前鼠标位置
    this.mousePos = {
      x: 0,
      y: 0
    }

    // 是否允许缩放
    this.zoom = 1.0
    this.minZoom = 0.1
    this.maxZoom = 10
    this.zoomFactor = 1.25

    // 操作列表（用于Undo， Redo）
    this.maxAction = 50
    this.actions = []
    // 当前操作列表游标索引
    this.actionIndex = -1

    // 当前选中的节点
    this.select = null
    this.selectPos = null
    this.orderCache = {}

    // 根节点
    this.addRootNode()

    // 鼠标事件
    this.stage.on('mousedown', (evt) => {
      let shape = evt.target
      let node = this.findNodeParent(shape)
      if (node && node.nodeType() === 'label') {
        node = node.parent()
      }

      if (this.select !== node) {
        if (this.select) {
          this.select.selected(false)
        }
        this.select = node
        if (this.select) {
          this.selectPos = this.stage.getPointerPosition()
          this.select.selected(true)
        }
      }
      // 判断是否可拖放
      if (this.select && this.select.canMove() && evt.evt.button == 0) {
        this.dragMarker.setAttr('@drag', this.select)
        this.isDraging = false
      }

      this.refresh()
    })

    this.stage.on('mouseup', (evt) => {
      if (!this.isDraging) {
        this.isDraging = false
        this.dragMarker.setAttr('@drag', null)
      }
    })

    this.stage.on('mousemove', (evt) => {
      this.mousePos = this.stage.getPointerPosition()
      let drag = this.dragMarker.getAttr('@drag')
      if (drag && !this.isDraging && !this.isReadOnly()) {
          this.isDraging = true
          this.dragMarker.startDrag()
      }
    })

    this.stage.on('dblclick', (evt) => {
      if (this.select && this.select !== this.root) {
        if (!this.isReadOnly() || this.isDebug()) {
          this.options.events.edit && this.options.events.edit(this.select)
        }
      }
    })

    this.stage.on('dragstart', (evt) => {
    })

    this.stage.on('dragmove', (evt) => {
      if (evt.target instanceof Konva.Stage || this.isReadOnly()) {
        return
      }

      this.mousePos = this.stage.getPointerPosition()
      let shape = this.stage.getIntersection(this.mousePos)
      if (shape instanceof Konva.Arrow) {
        shape = null
      }
      let node = this.findNodeParent(shape)

      let drag = this.dragMarker.getAttr('@drag')
      let dragtype = drag.nodeType()

      // 进行预处理
      let drop = {}
      if (node === drag) {} else {
        if (shape) {
          if (shape.hasName('dropzone') && shape.canDrop(dragtype)) { // 节点内部投放区域
            drop.type = 'dropzone'
            drop.zone = shape
            drop.node = node
          } else if (node.isType('accessory') && node.canDrop(dragtype)) {
            drop.type = 'accessory'
            drop.node = node
            drop.zone = node
          }
        } else if (drag.isType('entity')) { // 处理实体节点
          // 遍历实体
          let nodes = this.layers.model.find('.entity')
          for (let n of nodes) {
            let entity = n.getAttr('@node')
            // 检查实体是否有效或可见
            if (!entity.canAcceptChild() || !entity.isVisible()) {
              continue
            }
            // 不能将父节点拖到自身后代节点上
            if (entity === drag || entity.hasParent(drag)) {
              continue
            }

            // 如果是Root节点，只能接受composite, 节点Level>1
            if (entity === this.root && (!drag.isType('composite') || drag.level() <= 1)) {
              continue
            }

            let index = entity.intersection(this.mousePos)
            if (index >= 0) {
              drop.type = 'child'
              drop.index = index
              drop.node = entity
              break
            }
          }
        }

        let oldDrop = this.dropMarker.getAttr('@drop')

        if (oldDrop &&
          oldDrop.type === drop.type &&
          oldDrop.zone === drop.zone &&
          oldDrop.index === drop.index &&
          oldDrop.node === drop.node) { // 完全相同
        } else {
          this.dropMarker.setAttr('@drop', drop)

          if (oldDrop) {
            if (oldDrop.zone) {
              oldDrop.zone.setDropping(false)
            } else if (oldDrop.index >= 0) {
              oldDrop.node.setChildDropping(-1)
            }
          }

          if (drop.zone) {
            drop.zone.setDropping(true)
          } else if (drop.index >= 0) {
            drop.node.setChildDropping(drop.index)
          }
        }
      }
    })

    this.stage.on('dragend', (evt) => {
      if (this.isDraging) {
        this.dragMarker.stopDrag()
        // 执行拖放处理
        let drag = this.dragMarker.getAttr('@drag')
        let dragtype = drag.nodeType()
        let drop = this.dropMarker.getAttr('@drop')
        if (drop) {
          if (drop.zone) {
            drop.zone.setDropping(false)
            let parent = drop.node
            let index = -1
            if (drop.type === 'accessory') {
              parent = drop.node.parent()
              if (dragtype === 'decorator') {
                index = parent.decorators.indexOf(drop.zone)
              } else if (dragtype === 'service') {
                index = parent.service.indexOf(drop.zone)
              }
            }
            parent.insertElement(drag, index)
          } else if (drop.index >= 0) {
            drop.node.setChildDropping(-1)
            drop.node.insertChild(drag, drop.index)
          }
          this.snapshot()
        }
        this.updateOrder()
        this.dragMarker.setAttr('@drag', null)
        this.isDraging = false
        this.dragMarker.stopDrag()
      }
    })
    this.refresh()

    // focus
    this.cache = null
    let container = this.stage.container()
    // 阻止右键菜单
    container.oncontextmenu = function (event) {
      event.preventDefault()
    }
    container.tabIndex = 1
    container.focus()

    container.addEventListener('keydown', (evt) => {
      if (evt.ctrlKey === true) {
        if (evt.keyCode === 67) { // C
          if (this.select && this.select !== this.root) { // Root节点不能复制 
            this.cache = Aquila.Utils.common.clone(this.select.toJson())
          }
        } else if (evt.keyCode === 86) { // V
          if (this.cache) {
            // 判断当前选中节点
            let sel = this.selectedNode()
            if (sel && sel.isType('label')) {
              sel = sel.parent()
            }
            // 如果是Element
            if (this.cache.config.names['label']) {
              // 判断节点是否能够接受
              if (this.cache.type === 'decorator' && sel.canAcceptDecorator()) {
                sel.addDecorator(this.cache.config)
                this.snapshot()
              } else if (this.cache.type === 'service' && sel.canAcceptService()) {
                sel.addService(this.cache.config)
                this.snapshot()
              } else {
                return
              }
            } else if (this.cache.config.names['entity']) {
              if ((sel === this.root) && this.topNode()) {
                sel = this.topNode()
              }

              if (sel.canAcceptChild()) {
                let n = this.createEntity(this.cache)
                if (n) {
                  sel.addChild(n)
                  this.snapshot()
                } else {
                  return
                }
              }
            }
            this.updateOrder()
          }
        } else {
          return
        }
      } else {
        if (this.select && this.select !== this.root) { // Root节点除外
          if (evt.keyCode === 37) { // Left


          } else if (evt.keyCode === 39) { // Right

          }
        }
        return
      }
      evt.preventDefault()
      this.layers.model.batchDraw()
    })
  }

  /**
   * 缓冲快照
   */
  snapshot () {
    if (this.actions.length >= this.maxAction) {
      this.actions.splice(0, 1)
    }

    // 一旦添加快照，删除当前undo队列后续缓存
    if (this.actionIndex >= 0 && this.actionIndex < this.actions.length - 1) {
      this.actions.splice(this.actionIndex + 1, this.actions.length - this.actionIndex - 1)
    }

    let cache = this.saveToJson()
    this.actions.push(cache)
    this.actionIndex = this.actions.length - 1
  }

  /**
   * 刷新显示
   */
  refresh () {
    this.stage.draw()
  }

  updateOrder () {
    this.root.updateOrder(-1)
  }

  /**
   * 
   * @param {*} order 
   * @param {*} entity 
   */
  cacheOrder(order, entity) {

  }

  /**
   * 查找所在Group对象
   * @param shape
   * @returns {*}
   */
  findNodeParent (shape) {
    // 如果自己满足条件，返回自己
    let p = shape
    while (p) {
      if (p instanceof Konva.Group && p.hasName('node')) {
        break
      }
      p = p.getParent()
    }
    return p ? p.getAttr('@node') : null
  }

  /**
   * 添加根节点
   */
  addRootNode () {
    this.root = new BTRootNode({
      x: 20,
      y: this.stage.height() / 2
    })
    this.layers.model.add(this.root.knode())
  }

  /**
   * 添加Selector节点
   * @param {*} option
   */
  addSelectorNode (option) {
    let opt = Object.assign({}, option)
    let parent = this.getNode(opt.parent)
    let node = new BTSelectorNode(opt.config)
    parent.addChild(node)
    return node
  }

  /**
   * 添加Sequence节点
   * @param {*} option
   */
  addSequenceNode (option) {
    let opt = Object.assign({}, option)
    let parent = this.getNode(opt.parent)
    let node = new BTSequenceNode(opt.config)
    parent.addChild(node)
    return node
  }

  /**
   * 添加Parallel节点
   * @param {*} option
   */
  addParallelNode (option) {
    let opt = Object.assign({}, option)
    let parent = this.getNode(opt.parent)
    let node = new BTParallelNode(opt.config)
    parent.addChild(node)
    return node
  }

  /**
   * 添加Sequence节点
   * @param {*} option
   */
  addTaskNode (option) {
    let opt = Object.assign({}, option)
    let parent = this.getNode(opt.parent)
    let node = new BTTaskNode(opt.config)
    parent.addChild(node)
    return node
  }

  /**
   * 根据ID获取Node
   * @param {*} uid string 为空则返回根节点
   */
  getNode (uid) {
    if (uid) {
      let nodes = this.layers.model.find('#' + uid)
      if (nodes.length > 0) {
        if (nodes.length !== 1) {
          Aquila.Logger.warn(`Stage::getNode - Node <${uid}> is not unique`)
        }
        let node = nodes[0].getAttr('@node')
        if (node instanceof BTEntityNode) {
          return node
        } else {
          Aquila.Logger.error(`Stage::getNode - Node <${uid}> is not BTEnittyNode`)
        }
      }
    }
    return this.root
  }

  /**
   * 改变大小
   * @param w
   * @param h
   */
  resize (w, h) {
    w && this.stage.width(w)
    h && this.stage.height(h)
    this.stage.draw()
  }

  /**
   * 放大
   */
  zoomIn () {
    if (!this.options.canZoom) {
      return
    }
    this.zoom = Aquila.Utils.lodash.clamp(this.zoom * this.zoomFactor, this.minZoom, this.maxZoom)
    this.stage.scale({
      x: this.zoom,
      y: this.zoom
    })
    this.refresh()
  }

  zoomOut () {
    if (!this.options.canZoom) {
      return
    }
    this.zoom = Aquila.Utils.lodash.clamp(this.zoom / this.zoomFactor, this.minZoom, this.maxZoom)
    this.stage.scale({
      x: this.zoom,
      y: this.zoom
    })
    this.refresh()
  }

  reset () {
    this.zoom = 1.0
    this.stage.scale({
      x: this.zoom,
      y: this.zoom
    })
    this.stage.position({
      x: 0,
      y: 0
    })
    this.refresh()
  }

  /**
   * 获取当前选中节点，如果没有则返回根节点
   */
  selectedNode () {
    return this.select ? this.select : this.root
  }

  /**
   * 顶层节点
   */
  topNode () {
    return this.root.children[0]
  }
  /**
   * 清空编辑器，不能撤销
   * @param cache boolean 是否清除快照缓冲
   */
  clear (cache = true) {
    // 是否被修改
    this.modified = false

    // 清除缓存
    if (cache) {
      this.actions = []
      // 当前操作列表游标索引
      this.actionIndex = -1
    }

    this.select = null
    this.isDraging = false
    this.dragMarker.setAttr('@drag', null)
    this.dropMarker.setAttr('@drop', null)

    // 删除根节点
    this.root.selected(false)
    this.root.clearChildren()

    this.refresh()
  }

  /**
   * 
   * @param {*} data 
   */
  createEntity (data) {
    if (!data || !data.type) {
      return null
    }
    let entity = null
    if (data.type === 'selector') {
      entity = new BTSelectorNode(data.config)
    } else if (data.type === 'sequence') {
      entity = new BTSequenceNode(data.config)
    } else if (data.type === 'parallel') {
      entity = new BTParallelNode(data.config)
    } else if (data.type === 'task') {
      entity = new BTTaskNode(data.config)
    }
    
    if (!entity) {
      Aquila.Logger.error(`BTStage::addEnity failed - unknown node : ${data.type}`)
      return null
    }

    // 创建elements
    if (data.elements) {
      for (let elem of data.elements) {
        if (elem.type === 'decorator') {
          entity.addDecorator(elem.config, -1, false)
        } else if (elem.type === 'service') {
          entity.addService(elem.config, -1, false)
        }
      }
    }

    // 创建子节点
    if (data.children) {
      for (let child of data.children) {
        let n = this.createEntity(child)
        if (!n) {
          continue
        }
        entity.addChild(n, false)
      }
    }

    return entity
  }

  /**
   * 加载模型
   * @param data 快照数据
   * @param cache  boolean 是否清除快照缓冲
   */
  loadFromJson(data, cache = true) {
    // 清空面板
    this.clear(cache)

    if (!data) {
      return
    }

    // 解析读取data
    // 根节点
    let top = null
    if (data.root) {
      top = this.createEntity(data.root)
      if (!top) {
        Aquila.Logger.error('BTStage::loadFromJson failed - data.root is currupted')
        return
      }
      this.root.addChild(top)
    } else {
      Aquila.Logger.warn('BTStage::loadFromJson - data is null')
      return
    }

    this.root.adjust({
      downward: true
    })
    this.updateOrder()
    
    // 如果清除之前缓存，则重新构建新缓存
    if (cache) {
      this.snapshot()
    }

    this.refresh()
  }

  /**
   * 保存模型
   */
  saveToJson () {
    let json = {}
    let top = this.root.children[0]
    if (top) {
      json.root = top.toJson()
    }
    return Aquila.Utils.common.clone(json)
  }
 
  /**
   * 保存为Image
   */
  saveToImage () {

  }

  /**
   * 是否有undo
   * @returns {boolean}
   */
  hasUndo () {
    return this.actions.length > 1 && this.actionIndex > 0
  }

  /**
   * 撤销
   */
  undo () {
    if (this.actions.length <= 1) {
      this.actionIndex = this.actions.length - 1
      return
    }

    if (this.actionIndex < 0) {
      this.actionIndex = this.actions.length - 1
    }

    if (this.actionIndex > 0) {
      this.actionIndex -= 1
      let cache = this.actions[this.actionIndex]
      // 加载之前缓冲（保留缓冲队列）
      this.loadFromJson(cache, false)
    }
  }

  /**
   * 是否有redo
   * @returns {boolean}
   */
  hasRedo () {
    return this.actionIndex >= 0 && (this.actionIndex < this.actions.length - 1)
  }

  /**
   * 重做
   */
  redo () {
    if (this.actionIndex < 0) {
      return
    }

    if (this.actionIndex < this.actions.length - 1) {
      this.actionIndex += 1
      let cache = this.actions[this.actionIndex]
      // 加载之前缓冲（保留缓冲队列）
      this.loadFromJson(cache, false)
    }
  }

  /**
   * 
   */
  isReadOnly () {
    return this.options.readonly
  }

  isDebug() {
    return this.options.debug
  }

}

export default BTStage