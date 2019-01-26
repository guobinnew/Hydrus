import Aquila from '../aquila/index'
import Konva from 'konva'
import uniqid from 'uniqid'
import Utils from './node-utils'

class BTNode {
  constructor (config) {
    this.config = Aquila.Utils.lodash.merge({
      width: Utils.node.minWidth,
      height: Utils.node.minHeight,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 1,
      uid: uniqid(), // 自动生成
      canClose: true
    },
    Aquila.Utils.common.clone(config))

    this.root = new Konva.Group({
      x: this.config.x,
      y: this.config.y,
      draggable: false,
      name: 'node',
      id: this.config.uid
    })

    // 创建背景
    this.background = this.createBackground()
    this.root.add(this.background)

    // 创建关闭按钮
    if (this.config.canClose) {
      this.close = this.createCloseButton({
        size: 10,
        uid: this.config.uid,
        action: this.destroy
      })
      this.root.add(this.close)
    }

    // 创建内容
    this.createBody()

    this.adjust()
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
      strokeWidth: this.config.strokeWidth
    })
  }

  /**
   * 创建节点内容
   */
  createBody () {
    this.body = new Konva.Group({
      x: 0,
      y: 0,
      name: 'node-body'
    })
    this.root.add(this.body)
  }

  /**
   * 删除自己
   */
  destroy () {
  }

  /**
   * 创建close按钮
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
  createCloseButton (option) {
    let opt = Aquila.Utils.lodash.merge({
      x: 0,
      y: 0,
      size: 10,
      background: 'transparent',
      stroke: '#ddd',
      strokeWidth: 2,
      lineCap: 'round',
      lineJoin: 'round'
    }, option)

    // 删除按钮
    let close = new Konva.Group({
      x: opt.x,
      y: opt.y,
      rotation: 45,
      name: 'node-close'
    })

    let bg = new Konva.Circle({
      x: 0,
      y: 0,
      radius: opt.size / 2,
      fill: opt.background,
      stroke: opt.background
    })
    close.add(bg)

    let lineRadius = opt.size / 2 - 2
    let hline = new Konva.Line({
      points: [-lineRadius, 0, lineRadius, 0],
      stroke: opt.stroke,
      strokeWidth: opt.strokeWidth,
      lineCap: 'round',
      lineJoin: 'round'
    })
    close.add(hline)

    let vline = new Konva.Line({
      points: [0, -lineRadius, 0, lineRadius],
      stroke: opt.stroke,
      strokeWidth: opt.strokeWidth,
      lineCap: 'round',
      lineJoin: 'round'
    })
    close.add(vline)
    close.setAttr('pid', opt.uid)
    close.on('mousedown', opt.action)

    close.on('mouseout', function () {
      vline.setAttr('stroke', opt.stroke)
      hline.setAttr('stroke', opt.stroke)
      this.getLayer().draw()
    })

    close.on('mouseover', function () {
      vline.setAttr('stroke', '#FF3030')
      hline.setAttr('stroke', '#FF3030')
      this.getLayer().draw()
    })

    return close
  }

  /**
   * 调整宽度
   * @param {*} w 宽度
   */
  resizeWidth (w) {
    if (w) {
      // 调整背景
      this.background.width(w)
    }
    // 调整关闭按钮
    if (this.close) {
      let width = this.background.width()
      let bbox = this.close.getClientRect()
      // 调整close按钮
      this.close.position({
        x: width - bbox.width / 2,
        y: bbox.height / 2
      })
    }
  }

  /**
   * 调整布局
   */
  adjust () {
    let needWidth = Utils.node.minWidth
    let bbox = this.body.getClientRect()
    needWidth = Math.max(needWidth, bbox.width)

    this.resizeWidth(needWidth)
    this.background.height(bbox.height + 8)
  }

  /**
   * Canvas节点
   */
  node () {
    return this.root
  }

  /**
   * 获取位置
   */
  position () {
    return this.root.position()
  }
}

export default BTNode
