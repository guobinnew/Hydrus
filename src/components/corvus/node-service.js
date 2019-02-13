
import Aquila from '../aquila/index'
import Konva from 'konva'
import BTLabelNode from './node-label'
import Utils from './node-utils'

class BTServiceNode extends BTLabelNode {
  constructor (config) {
    super(Aquila.Utils.lodash.merge({
      fill: '#CD5B45',
      type: 'service',
      names: {
        accessory: true
      },
      canClose: true,
      canMove: true,
      canDrop: true,
      icon: 'service',
      acceptTypes: ['service']
    }, config))
  }

  destroy (self = true, notify = true) {
    // 通知父节点删除
    if (notify) {
      let parent = this.parent()
      if (parent) {
        parent.removeService(this)
      }
    }
    this.root.destroy()
  }
}

export default BTServiceNode
