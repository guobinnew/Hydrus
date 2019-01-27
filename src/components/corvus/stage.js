import Aquila from '../aquila/index'
import Konva from 'konva'
import uniqid from 'uniqid'
import BTEntityNode from './node-entity'
import BTRootNode from './node-root'
import BTSelectorNode from './node-composite-selector'
import BTSequenceNode from './node-composite-sequence'
import BTParallelNode from './node-composite-parallel'
import BTTaskNode from './node-task'
import BTLabelNode from './node-label'
import BTMarkerNode from './node-marker'

/**
 * 编辑面板
 */
class BTStage {
  constructor(options) {
    this.options = {
      draggable: true,
      canZoom: true
    }
    _.merge(this.options, options)
    this.stage = new Konva.Stage(this.options)
    this.stage.setAttr('btstage', this)

    this.layers = {}
    // 创建图层
    this.modelIndex = {}
    this.layers.model = new Konva.Layer()
    this.stage.add(this.layers.model)

    // 拖放层
    this.marker = new BTMarkerNode()
    this.marker.visible(false)

    this.dragNode = null
    this.layers.drag = new Konva.Layer()
    this.stage.add(this.layers.drag)

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

    // 根节点
    this.addRootNode()

    // 鼠标事件
    let stage = this
    this.stage.on('mousedown', (evt) => {
      let shape = evt.target
      let node = this.findNodeParent(shape)
      if (this.select !== node) {
        if (this.select) {
          this.select.selected(false)
        }
        if (node) {
          this.select = node
          this.select.selected(true)
        }
      }
    })

    this.stage.on('mouseup', (evt) => {
      let shape = evt.target
     
    })

    this.stage.on('mousemove', (evt) => {
      stage.mousePos = stage.stage.getPointerPosition()
    })

    this.stage.on('dragstart', (evt) => {
      if (stage.isLinking) {
        return
      }
      let target = evt.target
      if (target instanceof BTLabelNode) {
        let label = target
        let node = label.getAttr('btnode')
        let parent = node.parent()
        if (parent) {
          this.marker.shadow(label)
          let index = parent.indexOfElement(node)


        }

        this.layers.drag.add(label)
       
      } else if (target instanceof BTEntityNode) {

      }
    })

    this.stage.on('dragmove', (evt) => {
      
      let target = evt.target
      if (target instanceof Konva.Group) {
        let group = target
      }
    })

    this.stage.on('dragend', (evt) => {
      let target = evt.target
    })

    // let lines = [
    //   [0, 0, 25, 75,  100, 100],
    //   [0, 0, 25, 200 - 200/4,  100, 200],
    //   [0, 0, 25, 300 - 300/4,  100, 300],
    //   [0, 0, 25, 400 - 400/4,  100, 400],
    //   [0, 0, 25, 500 - 500/4,  100, 500]
    // ]

    // for (let l of lines) {
    //   var arrow = new Konva.Arrow({
    //     x: 100,
    //     y: 100,
    //     points: l,
    //     pointerLength: 10,
    //     pointerWidth: 10,
    //     fill: 'black',
    //     stroke: 'black',
    //     strokeWidth: 4,
    //     tension: 0.5
    //   })
    //   this.layers.model.add(arrow)
    // }

    this.update()
  }

  /**
   * 缓冲快照
   */
  snapshot() {

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
  update () {
    this.stage.draw()
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
    return p ? p.getAttr('btnode') : null
  }

  /**
   * 添加根节点
   */
  addRootNode () {
    this.root = new BTRootNode({
      x: this.stage.width() / 2,
      y: this.stage.height() / 2
    })
    this.layers.model.add(this.root.node())
  }

  /**
   * 添加Selector节点
   * @param {*} config 
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
   * @param {*} config 
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
   * @param {*} config 
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
   * @param {*} config 
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
        let node = nodes[0].getAttr('btnode')
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
   * 更新节点访问次序
   */
  updateOrder () {

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
    this.update()
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
    this.update()
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
    this.update()
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

    for (let mid of Object.keys(this.modelIndex)) {
      this.removeModel(mid)
    }

    this.modelIndex = {}
    this.update()
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

    // 如果清除之前缓存，则重新构建新缓存
    if (cache) {
      this.snapshot()
    }

    this.update()
  }

  /**
   * 保存模型
   */
  saveToJson () {
    let json = {}
    return json
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

}

export default BTStage