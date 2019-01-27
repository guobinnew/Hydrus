
import Konva from 'konva'
import BTNode from './node'
import Utils from './node-utils'

class BTMarkerNode extends BTNode {
  constructor () {
    super({
      acceptDecorator: false,
      acceptService: false,
      acceptChild: false,
      fill: Utils.marker.fill,
      canClose: false,
      canMove: false,
      type: 'label'
    })
    this.shadow = null
  }

  /**
   * 设置Host
   * @param {*} label 
   */
  shadow (label) {
    if (!label) {
      return this.shadow
    }
    this.shadow = label
    this.root.x(label.x())
    this.root.y(label.y())
    this.background.width(label.background.width())
    this.background.height(label.background.height())
    this.adjust()
  }
}

export default BTMarkerNode
