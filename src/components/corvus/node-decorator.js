
import Konva from 'konva'
import BTLabelNode from './node-label'
import Utils from './node-utils'

class BTDecoratorNode extends BTLabelNode {
  constructor (config) {
    super(Object.assign({
      fill: '#0000EE',
      type: 'decorator',
      canClose: true,
      canMove: true,
      canDrop: true,
      icon: 'decorator'
    }, config))
  }
}

export default BTDecoratorNode
