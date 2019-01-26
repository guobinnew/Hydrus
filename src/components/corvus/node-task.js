import Konva from 'konva'
import BTEntityNode from './node-entity'
import Utils from './node-utils'

class BTTaskNode extends BTEntityNode {
  constructor (config) {
    super(Object.assign({
      acceptService: false
    }, config))
  }
}

export default BTTaskNode
