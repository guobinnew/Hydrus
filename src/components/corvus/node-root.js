
import Konva from 'konva'
import BTEntityNode from './node-entity'
import Utils from './node-utils'

class BTRootNode extends BTEntityNode {
  constructor (config) {
    super(Object.assign({
      acceptDecorator: false,
      title: {
        type: 'root',
        icon: 'root',
        name: 'Root',
        subtitles:['aaa','我们','啊还得回家啊好多地方']
      }
    }, config))
  }
}

export default BTRootNode
