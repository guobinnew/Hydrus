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
      title: {},
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
    }, this.config.title))
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

    // zone.on('mouseout', function () {
    //   this.setAttr('fill', Utils.zone.fill)
    //   this.getLayer().draw()
    // })

    // zone.on('mouseover', function () {
    //   this.setAttr('fill', Utils.zone.highlight)
    //   this.getLayer().draw()
    // })

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
    } else {
      let i = (index >= this.children.length) ? this.children.length - 1 : index

      console.log('setChildDropping', index, i)
      // 计算位置和宽度
      let child = this.children[i]
      if (index >= this.children.length) {
        this.childZoneMarker.y(child.position().y + child.size().height + (Utils.node.childSpace.vertical - 8) / 2)
      } else {
        this.childZoneMarker.y(child.position().y - (Utils.node.childSpace.vertical + 8) / 2)
      }

      this.childZoneMarker.width(child.size().width)
      this.childZoneMarker.show()
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
    expand.setAttr('@pid', opt.uid)
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
    this.body.add(dec.knode())
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
    this.body.add(ser.knode())
    this.services.splice(index, 0, ser)
    this.adjust({
      downward: true
    })
    this.refresh()
    return ser
  }

  /**
   * 
   */
  replaceDecorator (dec, replacer) {
    //if ()
    //int index = this.decorators.indexOf(dec)
  }

  /**
   * 
   */
  replaceService (ser, replacer) {

  }

  /**
   * 
   */
  replaceChild (child, replacer) {

  }

  /**
   * 
   * @param {*} marker
   * @param {*} index 
   */
  exchangeMarker (host, marker, shadow = true) {

    this.body.add(marker.knode())
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
    this.childZone.add(child.knode())
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

    console.log(point, pos, zone)

    if (point.x < zone.left || point.x > zone.right) {
      return -1
    }

    let zoneHeight = 0
    let childHeights = []
    let allowance = 0
    for (let child of this.children) {
      let h = child.clientHeight()
      childHeights.push(h / 2 + allowance)
      allowance = h / 2 + Utils.node.childSpace.vertical
      zoneHeight += (h + Utils.node.childSpace.vertical)
    }
    childHeights.push(allowance)
    zoneHeight -= Utils.node.childSpace.vertical

    let height = this.background.height()
    zoneHeight = Math.max(height, zoneHeight)
    
    let index = -1
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
    if (opt.downward) {
      let offsetY = -this.clientHeight() / 2
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i]
        let childHeight = child.clientHeight()
        let link = this.links[i]
        child.knode().y(offsetY)
        // 调整连线
        let anchorY = offsetY + childHeight / 2
        link.points([0, 0, 25, anchorY * 3 / 4, Utils.node.childSpace.horizonal, anchorY])
        offsetY += (childHeight + Utils.node.childSpace.vertical)
      }
    }
  }
}

export default BTEntityNode
