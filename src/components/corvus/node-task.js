import Aquila from '../aquila/index'
import Konva from 'konva'
import BTEntityNode from './node-entity'
import Utils from './node-utils'

class BTTaskNode extends BTEntityNode {
  constructor (config) {
    super(Aquila.Utils.lodash.merge({
      acceptChild: false,
      type: 'task',
      label: {
        icon: 'task',
        title: 'Task',
        fill: '#6A5ACD',
        subtitles: ['task']
      }
    }, config))
  }
}

export default BTTaskNode
