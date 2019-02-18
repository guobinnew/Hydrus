import Aquila from 'orion-aquila'
import BTCompositeNode from './node-composite'

class BTSelectorNode extends BTCompositeNode {
  constructor (config) {
    super(Aquila.Utils.lodash.merge({
      type: 'selector',
      label: {
        icon: 'selector',
        title: 'Selector',
        fill: '#2E8B57',
        subtitles: ['selector']
      }
    }, config))
  }
}

export default BTSelectorNode
