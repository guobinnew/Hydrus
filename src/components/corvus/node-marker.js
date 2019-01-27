
import Konva from 'konva'
import BTEntityNode from './node-entity'
import Utils from './node-utils'

class BTMarkerNode extends BTEntityNode {
  constructor (config) {
    super(Object.assign({
      acceptDecorator: false,
      acceptService: false,
      acceptChild: false
    }, config))
  }
}

export default BTMarkerNode
