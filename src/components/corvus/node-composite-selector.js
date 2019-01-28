import Aquila from '../aquila/index'
import BTCompositeNode from './node-composite'

class BTSelectorNode extends BTCompositeNode {
  constructor (config) {
    super(Aquila.Utils.lodash.merge({
      type: 'selector',
      title: {
        icon: 'selector',
        title: 'Selector',
        fill: '#2E8B57',
        subtitles: ['selector']
      }
    }, config))
  }
}

export default BTSelectorNode
