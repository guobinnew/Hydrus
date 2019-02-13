
import Aquila from '../aquila/index'
import Konva from 'konva'
import BTLabelNode from './node-label'
import Utils from './node-utils'

class BTDecoratorNode extends BTLabelNode {
  constructor (config) {
    super(Aquila.Utils.lodash.merge({
      fill: '#0000EE',
      type: 'decorator',
      names: {
        accessory: true
      },
      canClose: true,
      canMove: true,
      canDrop: true,
      icon: 'decorator',
      subtitles: ['condition'],
      acceptTypes: ['decorator']
    }, config))
  }

  destroy (self = true, notify = true) {
    // 通知父节点删除
    if (notify) {
      let parent = this.parent()
      if (parent) {
        parent.removeDecorator(this)
      }
    }
    this.root.destroy()
  }
}

export default BTDecoratorNode
