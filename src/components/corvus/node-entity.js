import Aquila from '../aquila/index'
import Konva from 'konva'
import BTNode from './node'
import Utils from './node-utils'
import BTLabelNode from './node-label'
import BTServiceNode from './node-service'

class BTEntityNode extends BTNode {
  constructor (config) {
    super(Aquila.Utils.lodash.merge({
      acceptDecorator: true,
      acceptService: true,
      hasNext: true,
      fill: '#483D8B',
      stroke: '#191970',
      title: {
        type: 'entity',
        x: Utils.node.margin
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
    this.decorators = []
    this.services = []

    if (this.config.hasNext) {
      this.expand = this.createExpandButton({
        size: 12,
        uid: this.config.uid,
        action: function () {}
      })
      this.root.add(this.expand)
    }

    if (this.config.acceptDecorator) {
      this.decoratorZone = this.createDropZone({
        x: Utils.zone.margin,
        y: 2
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
        x: Utils.zone.margin,
        y: this.config.height - Utils.zone.height - 2
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
  createDropZone(config) {
    let zone = new Konva.Rect({
      x: config.x,
      y: config.y,
      width: this.config.width - 2 * Utils.zone.margin,
      height: Utils.zone.height,
      fill: Utils.zone.fill,
      stroke: Utils.zone.fill,
      strokeWidth: 1
    })

    zone.on('mouseover', function () {
      this.setAttr('fill', Utils.zone.highlight)
      this.getLayer().draw()
    })

    zone.on('mouseout', function () {
      this.setAttr('fill', Utils.zone.fill)
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

    let lineRadius = opt.size / 2 - 2
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
   */
  addDecorator (config) {

  }

  /**
   * 
   * @param {*} config 
   */
  addService (config) {

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
      // 调整close按钮
      this.expand.position({
        x: width,
        y: height / 2
      })
    }
    
    if (w) {
      this.decoratorZone && this.decoratorZone.width(w - 2 * Utils.zone.margin)
      this.serviceZone && this.serviceZone.width(w - 2 * Utils.zone.margin)
      for (let c of this.elements()) {
        c.resizeWidth(w - 2 * Utils.node.margin)
      }
    }
  }

  /**
   * 
   */
  elements () {
    return [].concat(this.decorators, this.title, this.services)
  }

  /**
   * 调整布局
   */
  adjust () {
    // 计算宽高
    let needWidth = 0
    let offsetY = Utils.zone.height + 1 + Utils.node.space
    //
    for (let elem of this.elements()) {
      elem.node().y(offsetY)
      elem.adjust()
      let bbox = elem.node().getClientRect()
      needWidth = Math.max(needWidth, bbox.width)
      offsetY += bbox.height + Utils.node.space
    }

    needWidth = Math.max(Utils.node.minWidth, needWidth + 2 * Utils.node.margin)
    let needHeight = Math.max(Utils.node.minHeight, offsetY + Utils.zone.height + 2)

    this.resizeWidth(needWidth)
    this.background.height(needHeight)
    this.serviceZone.y(needHeight - Utils.zone.height - 1)
    this.expand.y(needHeight / 2)
  }
}

export default BTEntityNode
