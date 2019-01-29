import Aquila from '../aquila/index'
import BTCompositeNode from './node-composite'

class BTSequenceNode extends BTCompositeNode {
  constructor (config) {
    super(Aquila.Utils.lodash.merge({
      type: 'sequence',
      label: {
        icon: 'sequence',
        title: 'Sequence',
        fill: '#A0522D',
        subtitles: ['sequence']
      }
    }, config))
  }
}

export default BTSequenceNode
