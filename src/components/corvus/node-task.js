import Konva from 'konva'
import BTEntityNode from './node-entity'
import Utils from './node-utils'

class BTTaskNode extends BTEntityNode {
  constructor (config) {
    super(Object.assign({
      acceptChild: false,
      title: {
        type: 'task',
        icon: 'task',
        name: 'Task',
        fill: '#6A5ACD',
        subtitles: ['task']
      }
    }, config))
  }
}

export default BTTaskNode
