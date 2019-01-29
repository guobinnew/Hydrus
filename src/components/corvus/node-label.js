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
      subtitles: []
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
  
    let title = new Konva.Text({
      x: 32,
      y: 8,
      text: this.config.title,
      fontSize: Utils.label.fontSize,
      fill: '#fff',
      draggable: false
    })
    this.body.add(title)

    let offsetY = Utils.label.space + Utils.label.iconSize
    if (this.config.subtitles.length === 0) {
      this.config.subtitles.push('')
    }
    console.log(this.config.subtitles)
    for (let sub of this.config.subtitles) {
      let subtitle = new Konva.Text({
        x: 6,
        y: offsetY,
        text: sub,
        fontSize: Utils.label.subFontSize,
        fill: '#fff',
        draggable: false
      })
      this.body.add(subtitle)
      offsetY += 12 + Utils.label.space
    }
    this.root.add(this.body)
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
    let stage = this.stage()
    let zoom = stage ? stage.zoom : 1.0
    let bbox = this.body.getClientRect()
    needWidth = Math.max(needWidth, bbox.width / zoom + 24)

    this.resizeWidth(needWidth)
    this.background.height(bbox.height / zoom + 8)
  }

}

export default BTLabelNode