import Aquila from '../aquila/index'
import Konva from 'konva'
import BTNode from './node'
import Utils from './node-utils'
import BTLabelNode from './node-label'
import BTDecoratorNode from './node-decorator'
import BTServiceNode from './node-service'

class BTEntityNode extends BTNode {
  constructor (config) {
    super(Aquila.Utils.lodash.merge({
      acceptDecorator: true,
      acceptService: true,
      acceptChild: true,
      fill: '#483D8B',
      stroke: '#191970',
      label: {},
      type: 'entity',
      names: { entity: true },
      canMove: true
    }, config))
  }

  /**
   * 创建背景
   */
  createBackground () {
    return new Konva.Rect({
      x: 0,
      y: 0,
      width: this.config.width,
      height: this.config.height,
      draggable: false,
      fill: this.config.fill,
      stroke: this.config.stroke,
      strokeWidth: this.config.strokeWidth,
      cornerRadius: 4,
      shadowColor: 'black',
      shadowBlur: 10,
      shadowOffset: {
        x: 4,
        y: 4
      },
      shadowOpacity: 0.6
    })
  }

  /**
   * 创建节点内容
   */
  createBody () {
    super.createBody()
    this.body.x(Utils.node.margin)
    this.decorators = []
    this.services = []
    this.children = []

    if (this.config.acceptChild) {
      let width = this.background.width()
      let height = this.background.height()
      this.childZone = new Konva.Group({
        x: width + Utils.node.childSpace.horizonal,
        y: height / 2
      })
      this.root.add(this.childZone)
      this.childZoneMarker = new Konva.Rect({
        x: 0,
        y: 0,
        width: 0,
        height: 8,
        fill: Utils.zone.highlight,
        visible: false
      })
      this.childZone.add(this.childZoneMarker)

      // 连线组
      this.links = []
      this.linkZone = new Konva.Group({
        x: width,
        y: height / 2
      })
      this.root.add(this.linkZone)

      this.childZoneLink = new Konva.Arrow({
        x: 0,
        y: 0,
        points: [0, 0, 25, 0, Utils.node.childSpace.horizonal, 0],
        pointerLength: 8,
        pointerWidth: 8,
        fill: Utils.zone.highlight,
        stroke: Utils.zone.highlight,
        strokeWidth: 4,
        tension: 0.5,
        visible: false
      })
      this.linkZone.add(this.childZoneLink)

      this.isExpanding = true
      this.expand = this.createExpandButton({
        size: 12,
        action: this.toggleExpand.bind(this)
      })
      this.root.add(this.expand)
    }

    if (this.config.acceptDecorator) {
      this.decoratorZone = this.createDropZone({
        x: Utils.zone.padding,
        y: 2,
        acceptTypes: ['decorator']
      })
      this.body.add(this.decoratorZone)
    }

    if (this.config.decorators) {
      for (let dec of this.config.decorators) {
        this.addDecorator(dec)
      }
    }

    this.title = new BTLabelNode(Aquila.Utils.lodash.merge({
      canMove: false,
      names: { entitylabel: true }
    }, this.config.label))
    this.body.add(this.title.knode())

    if (this.config.acceptService) {
      this.serviceZone = this.createDropZone({
        x: Utils.zone.padding,
        y: this.config.height - Utils.zone.height - 2,
        acceptTypes: ['service']
      })
      this.body.add(this.serviceZone)
    }

    if (this.config.services) {
      for (let ser of this.config.services) {
        this.addService(ser)
      }
    }
  }

  /**
   * 
   * @param {*} config 
   */
  createDropZone (config) {
    let zone = new Konva.Rect({
      name: 'dropzone',
      x: config.x,
      y: config.y,
      width: this.config.width - 2 * (Utils.zone.padding + Utils.node.margin),
      height: Utils.zone.height,
      fill: Utils.zone.fill,
      stroke: Utils.zone.fill,
      strokeWidth: 1
    })
    // 接受的drop类型
    zone.setAttr('@types', config.acceptTypes)

    zone.canDrop = function (type) {
      let arr = zone.getAttr('@types')
      return arr.indexOf(type) >= 0
    }
  
    zone.setDropping = function (flag) {
      zone.setAttr('fill', flag ? Utils.zone.highlight : Utils.zone.fill)
      zone.getLayer().draw()
    }

    return zone
  }

  /**
   * 
   * @param {*} index int -1 表示隐藏 
   */
  setChildDropping (index) {
    if (!this.config.acceptChild) {
      return
    }

    if (index < 0) {
      this.childZoneMarker.hide()
      this.childZoneLink.hide()
    } else {
      if (this.children.length > 0) {
        let i = (index >= this.children.length) ? this.children.length - 1 : index
        // 计算位置和宽度
        let child = this.children[i]
        if (index >= this.children.length) {
          this.childZoneMarker.y(child.position().y + child.size().height + (Utils.node.childSpace.vertical - 8) / 2)
        } else {
          this.childZoneMarker.y(child.position().y - (Utils.node.childSpace.vertical + 8) / 2)
        }
        this.childZoneMarker.width(child.size().width)
      } else {
        this.childZoneMarker.y(-this.childZoneMarker.height() / 2)
        this.childZoneMarker.width(Utils.node.minWidth)
      }
  
      this.childZoneMarker.show()
      let anchorY = this.childZoneMarker.y() + this.childZoneMarker.height() / 2
      this.childZoneLink.points([0, 0, 25, anchorY * 3 / 4, Utils.node.childSpace.horizonal, anchorY])
      this.childZoneLink.show()
    }

    this.refresh()
  }


  /**
   * 创建expand按钮
   * @param option
   * {
   *   uid:
   *   x:
   *   y:
   *   size:
   *   background:
   *   action:
   * }
   */
  createExpandButton (option) {
    let opt = Aquila.Utils.lodash.merge({
      x: 0,
      y: 0,
      size: 12,
      background: '#ddd',
      stroke: '#333',
      strokeWidth: 2,
      lineCap: 'round',
      lineJoin: 'round',
      isExpanding: true
    }, option)

    // expand按钮
    let expand = new Konva.Group({
      x: opt.x,
      y: opt.y,
      name: 'node-expand'
    })

    let bg = new Konva.Circle({
      x: 0,
      y: 0,
      radius: opt.size / 2,
      fill: opt.background,
      stroke: opt.stroke,
      strokeWidth: 1
    })
    expand.add(bg)

    let lineRadius = opt.size / 2 - 3
    let hline = new Konva.Line({
      points: [-lineRadius, 0, lineRadius, 0],
      stroke: opt.stroke,
      strokeWidth: opt.strokeWidth,
      lineCap: 'round',
      lineJoin: 'round'
    })
    expand.add(hline)

    let vline = new Konva.Line({
      points: [0, -lineRadius, 0, lineRadius],
      stroke: opt.stroke,
      strokeWidth: opt.strokeWidth,
      lineCap: 'round',
      lineJoin: 'round',
      visible: !opt.isExpanding
    })
    expand.add(vline)
    expand.on('mousedown', opt.action)

    expand.on('mouseout', function () {
      vline.setAttr('stroke', opt.stroke)
      hline.setAttr('stroke', opt.stroke)
      this.getLayer().draw()
    })

    expand.on('mouseover', function () {
      vline.setAttr('stroke', '#FF3030')
      hline.setAttr('stroke', '#FF3030')
      this.getLayer().draw()
    })

    expand.setExpand = function (flag) {
      vline.visible(!flag)
      this.getLayer().draw()
    }

    return expand
  }

  /**
   * 
   * @param {*} config 
   * @param index number
   */
  addDecorator (config, index = -1, adjust = true) {
    let dec = new BTDecoratorNode(config)
    this.body.add(dec.knode())
    if (index < 0 || index > this.decorators.length) {
      this.decorators.push(dec)
    } else {
      this.decorators.splice(index, 0, dec)
    }
    
    if (adjust) {
      this.adjust({
        downward: true,
        upward: true
      })
      this.refresh()
    }
    return dec
  }

  /**
   * 
   * @param {*} config 
   * @param index number
   */
  addService (config, index = -1, adjust = true) {
    let ser = new BTServiceNode(config)
    this.body.add(ser.knode())
    if (index < 0 || index > this.services.length) {
      this.services.push(ser)
    } else {
      this.services.splice(index, 0, ser)
    }
    if (adjust) {
      this.adjust({
        downward: true,
        upward: true
      })
      this.refresh()
    }

    return ser
  }

  /**
   * 计算索引
   * @param {*} oldIndex 
   * @param {*} newIndex 
   * @param length
   */
  computeValidIndex (oldIndex, newIndex, length) {
    if (length === 0) {
      return -1
    }

    if (length === 1) {
      return 0
    }

    if (newIndex < 0 || newIndex >= length) {
      return length - 1
    }

    if (newIndex === (oldIndex + 1)) {
      newIndex--
    }
    return newIndex
  }

  /**
   * 插入元素（Decorator或Service）
   * @param {*} elem 
   * @param {*} index 
   */
  insertElement (elem, index) {
    let type = elem.nodeType()
    if (type === 'decorator') {
      this.insertDecorator(elem, index)
    } else if (type === 'service') {
      this.insertService(elem, index)
    } else {
      Aquila.Logger.error(`BTEntityNode::insertElement failed - unknown element type: ${type}`)
    }
  }

 
  /**
   * 插入条件
   * @param {*} dec 
   * @param {*} index 
   */
  insertDecorator (dec, index) {
    if (!dec) {
      Aquila.Logger.error(`BTEntityNode::insertDecorator failed -  dec is null`)
      return
    }
    let decParent = dec.parent()
    // 如果是同一个父节点，则仅调整索引
    if (decParent === this) {
      let oldIndex = this.decorators.indexOf(dec)
      let newIndex = this.computeValidIndex(oldIndex, index, this.decorators.length)
      if (newIndex >= 0 && oldIndex !== newIndex) {
        [this.decorators[oldIndex], this.decorators[newIndex]] = [this.decorators[newIndex], this.decorators[oldIndex]]
      }
      this.adjust()
    } else { // 从原节点删除，移到新节点中
      decParent.removeDecorator(dec)
      this.body.add(dec.knode())
      this.decorators.splice(index, 0, dec)
      this.adjust({
        downward: true,
        upward: true
      })
    }
  }

  /**
   * 
   * @param {*} dec 
   */
  removeDecorator (dec) {
    if (!dec) {
      return
    }
    let index = this.decorators.indexOf(dec)
    this.decorators.splice(index, 1)
    dec.knode().remove()
    this.adjust({
      downward: true,
      upward: true
    })
  }

  /**
   * 插入服务
   * @param {*} ser BTServiceNode
   * @param {*} index int 索引位置
   */
  insertService (ser, index) {
    if (!ser) {
      Aquila.Logger.error(`BTEntityNode::insertService failed -  ser is null`)
      return
    }
    let serParent = ser.parent()
    // 如果是同一个父节点，则仅调整索引
    if (serParent === this) {
      let oldIndex = this.services.indexOf(ser)
      let newIndex = this.computeValidIndex(oldIndex, index, this.services.length)
      if (newIndex >= 0 && oldIndex !== newIndex) {
        [this.services[oldIndex], this.services[newIndex]] = [this.services[newIndex], this.services[oldIndex]]
      }
      this.adjust()
    } else { // 从原节点删除，移到新节点中
      serParent.removeService(ser)
      this.body.add(ser.knode())
      this.services.splice(index, 0, ser)
      this.adjust({
        downward: true,
        upward: true
      })
    }
  }

  /**
   * 删除服务
   * @param {*} ser BTServiceNode
   */
  removeService (ser) {
    if (!ser) {
      return
    }
    let index = this.services.indexOf(ser)
    this.services.splice(index, 1)
    ser.knode().remove()
    this.adjust({
      downward: true,
      upward: true
    })
  }

  /**
   * 
   * @param {*} child 
   * @param {*} index 
   */
  insertChild (child, index) {
    if (!child) {
      Aquila.Logger.error(`BTEntityNode::insertChild failed -  child is null`)
      return
    }
    let childParent = child.parent()
    // 如果是同一个父节点，则仅调整索引
    if (childParent === this) {
      let oldIndex = this.children.indexOf(child)
      let newIndex = this.computeValidIndex(oldIndex, index, this.children.length)
      if (newIndex >= 0 && oldIndex !== newIndex) {
        [this.children[oldIndex], this.children[newIndex]] = [this.children[newIndex], this.children[oldIndex]]
      }
      this.adjust()
    } else { // 从原节点删除，移到新节点中
      childParent.removeChild(child)
      this.expandChildren(true)
      this.childZone.add(child.knode())
      this.children.splice(index, 0, child)
      this.addChildLink()
      this.adjust({
        downward: true,
        upward: true
      })
    }
  }

  /**
   * 
   * @param {*} child 
   */
  removeChild (child) {
    if (!child) {
      return
    }
    let index = this.children.indexOf(child)
    this.children.splice(index, 1)
    child.knode().remove()

    let link = this.links[index]
    link.destroy()
    this.links.splice(index, 1)

    this.adjust({
      downward: true,
      upward: true
    })
  }

  /**
   * 
   */
  removeChildren () {
    for (let i = 0; i < this.children.length; i++) {
      let child = this.children[i]
      child.knode().remove()
      this.links[i].destroy()
    }
    this.links = []
    let list = [].concat(this.children)
    this.children = []
    return list
  }

  /**
   * 
   */
  addChildLink () {
    let link = new Konva.Arrow({
      x: 0,
      y: 0,
      points: [0, 0, 25, 0, Utils.node.childSpace.horizonal, 0],
      pointerLength: 8,
      pointerWidth: 8,
      fill: '#1c1c1c',
      stroke: '#1c1c1c',
      strokeWidth: 4,
      tension: 0.5,
      visible: this.isExpanding
    })
    this.linkZone.add(link)
    this.links.push(link)
    return link
  }

  /**
   * 
   * @param {*} node 
   */
  addChild (child, adjust = true) {
    if (!child || !this.config.acceptChild) {
      return
    }
    child.visible(this.isExpanding)
    this.childZone.add(child.knode())
    this.children.push(child)
    this.addChildLink()
    if (adjust) {
      this.adjust({
        downward: true,
        upward: true
      })
      this.refresh()
    }
  }

  /**
   * 判断插入位置
   * @param point // 画布点坐标
   * @return int 返回插入索引 -1 表示不能插入
   */
  intersection (point) {
    let width = this.background.width()
    let pos = this.root.getAbsolutePosition()
    let zoom = this.stage().zoom
    let zone = {
      left: pos.x + width * zoom,
      right: pos.x + (width + Utils.node.childSpace.horizonal) * zoom
    }

    if (point.x < zone.left || point.x > zone.right) {
      return -1
    }

    let index = -1
    let height = this.size().height
    // 如果没有子节点
    if (this.children.length === 0) {
      if (point.y > pos.y && point.y < (pos.y + height * zoom)) {
        index = 0
      }
    } else {
      let childHeights = []
      let allowance = 0
      let zoneHeight = 0
      for (let child of this.children) {
        let h = child.clientHeight()
        childHeights.push(h / 2 + allowance)
        allowance = h / 2 + Utils.node.childSpace.vertical
        zoneHeight += (h + Utils.node.childSpace.vertical)
      }
      childHeights.push(allowance)
      zoneHeight -= Utils.node.childSpace.vertical
      zoneHeight = Math.max(height, zoneHeight)
      
      let offsetY = pos.y + (height - zoneHeight) / 2 * zoom
      for (let i = 0; i < childHeights.length; i++) {
        if ((i === 0) && point.y < offsetY) {
          break
        }
        offsetY += (childHeights[i] * zoom)
        if (point.y < offsetY) {
          index = i
          break
        }
      }
    }

    return index
  }

  /**
   * 
   */
  indexOfElement (node) {
    if (node instanceof BTDecoratorNode) {
      return this.decorators.indexOf(node)
    } else if (node instanceof BTServiceNode) {
      return this.services.indexOf(node)
    }
    return -1
  }

  /**
   * 
   */
  indexOfChild (child) {
    if (child instanceof BTEntityNode) {
      return this.children.indexOf(child)
    }
    return -1
  }

  /**
   * 调整宽
   * @param {*} w 
   */
  resizeWidth (w) {
    // 调整背景
    super.resizeWidth(w)

    if (this.expand) {
      let width = this.background.width()
      let height = this.background.height()
      // 调整按钮
      this.expand.position({
        x: width,
        y: height / 2
      })
    }
    
    if (w) {
      let zoneWidth = w - 2 * (Utils.zone.padding + Utils.node.margin)
      this.decoratorZone && this.decoratorZone.width(zoneWidth)
      this.serviceZone && this.serviceZone.width(zoneWidth)
      for (let c of this.elements()) {
        c.resizeWidth(w - 2 * Utils.node.margin)
      }
      this.childZone && this.childZone.x(w + Utils.node.childSpace.horizonal)
      this.linkZone && this.linkZone.x(w)
    }
  }

  /**
   * 切换子节点展开/收起
   */
  toggleExpand () {
    this.isExpanding = !this.isExpanding
    this.expandChildren(this.isExpanding)
  }

  /**
   * 展开/收起子节点
   * @param {*} flag boolean
   */
  expandChildren (flag = true) {
    this.isExpanding = flag
    this.expand.setExpand(flag)

    for (let child of this.children) {
      child.visible(flag)
    }
    for (let link of this.links) {
      link.visible(flag)
    }
    this.refresh()
  }

  /**
   * 
   */
  elements () {
    return [].concat(this.decorators, this.title, this.services)
  }

    /**
   * 获取包含子节点的高度
   */
  childHeight () {
    let childHeight = 0
    for (let child of this.children) {
      childHeight += child.clientHeight()
      childHeight += Utils.node.childSpace.vertical
    }
    childHeight -= Utils.node.childSpace.vertical
    return childHeight
  }

  /**
   * 获取包含子节点的高度
   */
  clientHeight () {
    return Math.max(this.childHeight(), this.background.height())
  }
  /**
   * 调整布局
   */
  adjust (option) {
    let opt = Aquila.Utils.lodash.merge({
      downward: false,
      upward: false
    }, option)
    // 调整子节点布局
    if (opt.downward) {
      for (let child of this.children) {
        child.adjust({
          downward: true
        })
      }
    }

    // 计算宽高
    let needWidth = 0
    let offsetY = Utils.zone.height + 2 + Utils.node.space
    //
    for (let elem of this.elements()) {
      elem.knode().y(offsetY)
      elem.adjust()
      needWidth = Math.max(needWidth, elem.clientWidth())
      offsetY += (elem.clientHeight() + Utils.node.space)
    }

    needWidth = Math.max(Utils.node.minWidth, needWidth + 2 * Utils.node.margin)
    let needHeight = Math.max(Utils.node.minHeight, offsetY + Utils.zone.height + 2)

    this.resizeWidth(needWidth)
    this.background.height(needHeight)
    this.serviceZone && this.serviceZone.y(needHeight - Utils.zone.height - 2)
    this.expand && this.expand.y(needHeight / 2)
    this.childZone && this.childZone.y(needHeight / 2)
    this.linkZone && this.linkZone.y(needHeight / 2)

    // 调整子节点位置
    offsetY = -this.childHeight() / 2
    for (let i = 0; i < this.children.length; i++) {
      let child = this.children[i]
      let childHeight = child.clientHeight()
      let height = child.size().height
      let link = this.links[i]
      let y = offsetY + (childHeight - height) / 2
      child.knode().y(y)
      // 调整连线
      let anchorY = y + height / 2
      link.points([0, 0, 25, anchorY * 3 / 4, Utils.node.childSpace.horizonal, anchorY])
      offsetY += (childHeight + Utils.node.childSpace.vertical)
    }

    if (opt.upward) {
      let p = this.parent()
      while (p) {
        p.adjust()
        p = p.parent()
      }
    }
  }

  /**
   * 
   */
  destroy (self = true) {
    // 删除elements
    this.clearChildren()
    if (self) {
      for (let elem of this.elements()) {
        elem.destroy()
      }
      this.root.destroy()
    }
  }

  /**
   * 删除子节点
   */
  clearChildren () {
    // 删除elements
    if (this.children) {
      for (let child of this.children) {
        child.destroy()
      }
      this.children = []
    }

    if (this.links) {
      for (let link of this.links) {
        link.destroy()
      }
      this.links = []
    }

    this.adjust()
  }

  /**
   * 
   */
  label () {
    return this.title
  }

  /**
   * 
   */
  toJson () {
    let json = {
      type: this.config.type,
      config: this.config,
      elements: [],
      children: []
    }
    // Elements
    for (let dec of this.decorators) {
      console.log(dec)
      json.elements.push(dec.toJson())
    }

    for (let ser of this.services) {
      json.elements.push(ser.toJson())
    }

    // Children
    for (let child of this.children) {
      json.children.push(child.toJson())
    }
    return json
  }

  /**
   * 计算访问次序
   */
  updateOrder (start = -1) {
    if (start < 0) { // 所有order都为-1
      for (let elem of this.elements()) {
        elem.order(-1)
      }
      for (let child of this.children) {
        child.updateOrder()
      }
      return -1
    }

    let order = start
    if (order === 0) {
      // top节点
      for (let dec of this.decorators) {
        dec.order(-1)
      }
    } else {
      for (let dec of this.decorators) {
        dec.order(order++)
      }
    }

    this.label().order(order++)

    for (let ser of this.services) {
      ser.order(order++)
    }

    // 更新孩子节点
    for (let child of this.children) {
      order = child.updateOrder(order)
    }
    
    // 返回最后的order
    return order
  }

  /**
   * 
   * @param {*} type 
   */
  canAcceptDecorator () {
    return this.config.acceptDecorator
  }

  canAcceptService () {
    return this.config.acceptService
  }

  canAcceptChild () {
    return this.config.acceptChild
  }
}

export default BTEntityNode
