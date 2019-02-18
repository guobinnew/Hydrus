import Aquila from '../aquila/index'
import Konva from 'konva'
import BTNode from './node'
import Utils from './node-utils'

class BTLabelNode extends BTNode {
  constructor (config) {
    super(Aquila.Utils.lodash.merge({
      fill: '#1296db',
      canClose: false,
      canMove: true,
      canDrop: false,
      type: 'label',
      names: { label: true },
      icon: 'default',
      title: '',
      subtitles: [],
      order: -1  // 表示无效
    }, config))

    // 投放区
    let width = this.background.width()
    this.isDropping = false
    if (this.config.canDrop) {
      this.dropZone = this.createDropZone({
        x: 0,
        y: -Utils.label.dropHeight - 2,
        width: width,
        height: Utils.label.dropHeight
      })
      this.dropZone.visible(false)
      this.root.add(this.dropZone)
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
      width: config.width,
      height: config.height,
      fill: Utils.zone.highlight
    })
    return zone
  }

  /**
   * 创建标题栏
   */
  createBody () {
    super.createBody()

    let path = Utils.svg[this.config.icon]
    if (!path) {
      path = Utils.svg.default
    }

    let logo = new Konva.Path({
      x: 4,
      y: 4,
      data: path,
      fill: '#dddddd',
      draggable: false
    })
    logo.scaleX(Utils.label.iconSize * 1.0 / Utils.svg.baseSize)
    logo.scaleY(Utils.label.iconSize * 1.0 / Utils.svg.baseSize)
    this.body.add(logo)
  
    this.title = new Konva.Text({
      x: 32,
      y: 8,
      text: this.config.title,
      fontSize: Utils.label.fontSize,
      fill: '#fff',
      draggable: false
    })
    this.body.add(this.title)

    let offsetY = Utils.label.space + Utils.label.iconSize
    if (this.config.subtitles.length === 0) {
      this.config.subtitles.push(this.config.type)
    }

    this.subtitles = []
    for (let sub of this.config.subtitles) {
      let subtitle = this.createSubtitle({
        x: 6,
        y: offsetY,
        text: sub
      })
      this.subtitles.push(subtitle)
      this.body.add(subtitle)
      offsetY += 12 + Utils.label.space
    }
    this.root.add(this.body)

    // order
    this.orderZone = this.createOrder({
      y: 4,
      number: this.config.order
    })
    this.root.add(this.orderZone)
  }

  /**
   * 创建expand按钮
   * @param option
   * {
   *   x:
   *   y:
   *   size:
   *   background:
   *   text:
   * }
   */
  createOrder (option) {
    let opt = Aquila.Utils.lodash.merge({
      x: 0,
      y: 0,
      size: 14,
      background: '#ddd',
      stroke: '#999',
      strokeWidth: 2,
      lineCap: 'round',
      lineJoin: 'round',
      number: -1
    }, option)

    // order按钮
    let order = new Konva.Group({
      x: opt.x,
      y: opt.y,
      name: 'label-order',
      visible: opt.number >= -1
    })

    let bg = new Konva.Circle({
      x: 0,
      y: 0,
      radius: opt.size / 2,
      fill: opt.background,
      stroke: opt.stroke,
      strokeWidth: 1
    })
    order.add(bg)

    let number = new Konva.Text({
      x: 0,
      y: -Utils.label.orderFontSize / 2 + 1,
      text: opt.number,
      fontSize: Utils.label.orderFontSize,
      fill: opt.stroke,
      draggable: false
    })
    number.offsetX(number.width() / 2)
    order.add(number)
   
    order.on('mouseout', function () {
      bg.setAttr('fill', opt.background)
      number.setAttr('fill', opt.stroke)
      this.getLayer().draw()
    })

    order.on('mouseover', function () {
      bg.setAttr('fill', '#FF3030')
      number.setAttr('fill', '#FFC125')
      this.getLayer().draw()
    })

    // 必须手动刷新显示
    order.setNumber = function (num) {
      number.visible(num >= -1)
      number.text('' + num)
      number.offsetX(number.width() / 2)
    }

    return order
  }

  /**
   * 
   * @param {*} text 
   */
  createSubtitle (option) {
    return new Konva.Text({
      x: option.x,
      y: option.y,
      text: option.text,
      fontSize: Utils.label.subFontSize,
      fill: '#fff',
      draggable: false
    })
  }

  /**
   * 修改order
   * @param {*} i 
   */
  order (i) {
    if (i == null) {
      return this.config.order
    }

    this.config.order = i
    this.orderZone.setNumber(i)
  }

  /**
   * 
   */
  getTitle () {
    return this.config.title
  }

  /**
   * 
   */
  setTitle (title) {
    if (!title) {
      title = ''
    }

    if (this.config.title === title) {
      return
    }
    this.config.title = title
    this.title.text(title)
    this.adjust()
  }

  /**
   * 
   */
  getScript () {
    return this.config.script
  }

   /**
   * 
   */
  getScriptParameters () {
    !this.config.parameters && (this.config.parameters = [])
    return this.config.parameters
  }

  /**
   * 
   */
  setScript (script, parameters) {
    if (!script) {
      script = ''
    }

    if (this.config.script !== script) {
      this.config.script = script
    }
    
    if (!Aquila.Utils.common.isArray(parameters)) {
      parameters = []
    } else {
      this.config.parameters = [].concat(parameters)
    }
  
  }

   /**
   * 
   */
  getInvert () {
    return this.config.invert
  }

  /**
   * 
   */
  setInvert (inv) {
    if (inv == null) {
      inv = false
    }

    if (this.config.invert === inv) {
      return
    }
    this.config.invert = inv
    // TODO
  }

  getSubtitles () {
    return this.config.subtitles
  }

  setSubtitles (subtitles) {
    this.config.subtitles = [].concat(subtitles)
    // 调整内容
    let offsetY = Utils.label.space + Utils.label.iconSize
    for (let i = 0; i < this.config.subtitles.length; i++) {
      let text = this.config.subtitles[i]
      let subtitle = this.subtitles[i]
      if (!subtitle) {
        subtitle = this.createSubtitle({
          x: 6,
          y: offsetY,
          text: text
        })
        this.subtitles.push(subtitle)
        this.body.add(subtitle)
      } else {
        subtitle.text(text)
        subtitle.y(offsetY)
      }
      offsetY += 12 + Utils.label.space
    }

    if (this.subtitles.length > this.config.subtitles.length) {
      let nouse = this.subtitles.splice(this.config.subtitles.length, this.subtitles.length - this.config.subtitles.length)
      nouse.forEach((item) => {
        item.destroy()
      })
    }
    this.adjust()
  }

  /**
   * 判断是否能够接受
   * @param {*} type 
   */
  canDrop (type) {
    return this.config.acceptTypes.indexOf(type) >= 0
  }

  /**
   * 
   * @param {*} flag 
   */
  setDropping (flag) {
    if (!this.config.canDrop) {
      return
    }
    this.isDropping = flag
    this.dropZone.visible(this.isDropping)
    this.refresh()
  }

  /**
   * 获取包含子节点的高度
   */
  clientHeight () {
    return this.background.height()
  }

  /**
   * 获取包含子节点的高度
   */
  clientWidth () {
    return this.background.width()
  }

  /**
   * 调整宽
   * @param {*} w 
   */
  resizeWidth (w) {
    super.resizeWidth(w)

    if (w) {
      this.dropZone && this.dropZone.width(w)
    }
  }

  /**
   * 调整布局
   */
  adjust (option) {
    let needWidth = Utils.node.minWidth
    let bbox = this.body.getClientRect({
      skipTransform: true
    })
    needWidth = Math.max(needWidth, bbox.width + 24)
    this.resizeWidth(needWidth)
    this.background.height(bbox.height + 8)
  }
}

export default BTLabelNode