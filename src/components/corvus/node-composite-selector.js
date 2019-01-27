import BTCompositeNode from './node-composite'

class BTSelectorNode extends BTCompositeNode {
  constructor (config) {
    super(Object.assign({
      title: {
        type: 'selector',
        icon: 'selector',
        name: 'Selector',
        fill: '#2E8B57',
        subtitles: ['selector']
      }
    }, config))
  }
}

export default BTSelectorNode
