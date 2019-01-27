
import Konva from 'konva'
import BTLabelNode from './node-label'
import Utils from './node-utils'

class BTServiceNode extends BTLabelNode {
  constructor (config) {
    super(Object.assign({
      fill: '#CD5B45',
      type: 'service',
      canClose: true,
      canMove: true,
      canDrop: true,
      icon: 'service'
    }, config))
  }
}

export default BTServiceNode
