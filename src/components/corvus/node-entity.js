import Aquila from '../aquila/index'
import Konva from 'konva'
import BTNode from './node'
import Utils from './node-utils'
import BTLabelNode from './node-label'
import BTDecoratorNode from './node-decorator'
import BTServiceNode from './node-service'
import BTLabelMarkerNode from './node-marker'

class BTEntityNode extends BTNode {
  constructor (config) {
    super(Aquila.Utils.lodash.merge({
      acceptDecorator: true,
      acceptService: true,
      acceptChild: true,
      fill: '#483D8B',
      stroke: '#191970',
      title: {
        type: 'entity'
      }
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

      // 连线组
      this.links = []
      this.linkZone = new Konva.Group({
        x: width,
        y: height / 2
      })
      this.root.add(this.linkZone)

      this.isExpanding = true
      this.expand = this.createExpandButton({
        size: 12,
        uid: this.config.uid,
        action: this.toggleExpand.bind(this)
      })
      this.root.add(this.expand)
    }

    if (this.config.acceptDecorator) {
      this.decoratorZone = this.createDropZone({
        x: Utils.zone.padding,
        y: 2,
        drop: 'decorator'
      })
      this.body.add(this.decoratorZone)
    }

    if (this.config.decorators) {
      for (let dec of this.config.decorators) {
        this.addDecorator(dec)
      }
    }

    this.title = new BTLabelNode(this.config.title)
    this.body.add(this.title.node())

    if (this.config.acceptService) {
      this.serviceZone = this.createDropZone({
        x: Utils.zone.padding,
        y: this.config.height - Utils.zone.height - 2,
        drop: 'decorator'
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
      x: config.x,
      y: config.y,
      width: this.config.width - 2 * (Utils.zone.padding + Utils.node.margin),
      height: Utils.zone.height,
      fill: Utils.zone.fill,
      stroke: Utils.zone.fill,
      strokeWidth: 1
    })
    // 接受的drop类型
    zone.setAttr('btdrop', config.drop)

    zone.on('mouseout', function () {
      this.setAttr('fill', Utils.zone.fill)
      this.getLayer().draw()
    })

    zone.on('mouseover', function () {
      this.setAttr('fill', Utils.zone.highlight)
      this.getLayer().draw()
    })

    return zone
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
      lineJoin: 'round'
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
      lineJoin: 'round'
    })
    expand.add(vline)
    expand.setAttr('pid', opt.uid)
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
    return expand
  }

  /**
   * 
   * @param {*} config 
   * @param index number
   */
  addDecorator (config, index = -1) {
    let dec = new BTDecoratorNode(config)
    this.body.add(dec.node())
    this.decorators.splice(index, 0, dec)
    this.adjust({
      downward: true
    })
    this.refresh()
    return dec
  }

  /**
   * 
   * @param {*} config 
   * @param index number
   */
  addService (config, index = -1) {
    let ser = new BTServiceNode(config)
    this.body.add(ser.node())
    this.services.splice(index, 0, ser)
    this.adjust({
      downward: true
    })
    this.refresh()
    return ser
  }

  /**
   * 
   * @param {*} index 
   */
  addMarker (label, index = -1) {
    let marker = new BTLabelMarkerNode(label)
    this.body.add(marker.node())
    this.services.splice(index, 0, marker)
    this.adjust({
      downward: true
    })
    this.refresh()
  }

  /**
   * 
   * @param {*} node 
   */
  addChild (child) {
    if (!child || !this.config.acceptChild) {
      return
    }
    this.childZone.add(child.node())
    this.children.push(child)

    let link = new Konva.Arrow({
      x: 0,
      y: 0,
      points: [0, 0, 25, 0, Utils.node.space.horizonal, 0],
      pointerLength: 8,
      pointerWidth: 8,
      fill: '#1c1c1c',
      stroke: '#1c1c1c',
      strokeWidth: 4,
      tension: 0.5
    })
    this.linkZone.add(link)
    this.links.push(link)

    this.adjust({
      downward: true
    })
    this.refresh()
  }

  /**
   * 
   * @param {*} elem 
   * @param {*} index 
   */
  addElement(elem, index = -1) {

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
   * 
   * @param {*} child 
   */
  removeChild (child) {
    return null
  }

  /**
   * 
   */
  removeChildren () {
    return []
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
   * 
   */
  toggleExpand () {
    this.isExpanding = !this.isExpanding
    this.expandChildren(this.isExpanding)
  }
  /**
   * 
   * @param {*} flag 
   */
  expandChildren (flag = true) {
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
  clientHeight () {
    let childHeight = 0
    for (let child of this.children) {
      childHeight += child.clientHeight()
      childHeight += Utils.node.childSpace.vertical
    }
    childHeight -= Utils.node.childSpace.vertical
    return Math.max(childHeight, this.background.height())
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
      elem.node().y(offsetY)
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
    if (opt.downward) {
      let offsetY = -this.clientHeight() / 2
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i]
        let childHeight = child.clientHeight()
        let link = this.links[i]
        child.node().y(offsetY)
        // 调整连线
        let anchorY = offsetY + childHeight / 2
        link.points([0, 0, 25, anchorY * 3 / 4, Utils.node.childSpace.horizonal, anchorY])
        offsetY += (childHeight + Utils.node.childSpace.vertical)
      }
    }
  }
}

export default BTEntityNode
