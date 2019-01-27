import Aquila from '../aquila/index'
import Konva from 'konva'
import BTNode from './node'
import Utils from './node-utils'

class BTLabelNode extends BTNode {
  constructor (config) {
    super(Aquila.Utils.lodash.merge({
      fill: '#1296db',
      canClose: false,
      type: 'label',
      name: '',
      icon: 'default',
      subtitles: ['']
    }, config))
  }

  /**
   * 创建标题栏
   */
  createBody () {
    super.createBody()

    console.log('LABEL====', this.config)

    let path = Utils.svg[this.config.icon]
    if (!path) {
      path = Utils.svg.default
    }

    let logo = new Konva.Path({
      x: 4,
      y: 4,
      data: path,
      fill: '#dddddd'
    })
    logo.scaleX(Utils.label.iconSize * 1.0 / Utils.svg.baseSize)
    logo.scaleY(Utils.label.iconSize * 1.0 / Utils.svg.baseSize)
    this.body.add(logo)
  
    let title = new Konva.Text({
      x: 32,
      y: 8,
      text: this.config.name,
      fontSize: Utils.label.fontSize,
      fill: '#fff'
    })
    this.body.add(title)

    let offsetY = Utils.label.space + Utils.label.iconSize
    for (let sub of this.config.subtitles) {
      let subtitle = new Konva.Text({
        x: 6,
        y: offsetY,
        text: sub,
        fontSize: Utils.label.subFontSize,
        fill: '#fff'
      })
      this.body.add(subtitle)
      offsetY += 12 + Utils.label.space
    }
    this.root.add(this.body)
  }
}

export default BTLabelNode