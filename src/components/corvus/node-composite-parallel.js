import Aquila from '../aquila/index'
import BTCompositeNode from './node-composite'

class BTParallelNode extends BTCompositeNode {
  constructor (config) {
    super(Aquila.Utils.lodash.merge({
      type: 'parallel',
      title: {
        icon: 'parallel',
        title: 'Parallel',
        fill: '#EE2C2C',
        subtitles: ['parallel']
      }
    }, config))
  }
}

export default BTParallelNode
