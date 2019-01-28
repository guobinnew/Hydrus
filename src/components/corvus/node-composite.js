import Aquila from '../aquila/index'
import Konva from 'konva'
import BTEntityNode from './node-entity'

class BTCompositeNode extends BTEntityNode {
  constructor (config) {
    super(Aquila.Utils.lodash.merge({
      type: 'composite',
      names: {
        composite: true
      }
    }, config))
  }
}

export default BTCompositeNode
