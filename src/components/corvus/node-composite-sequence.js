import BTCompositeNode from './node-composite'

class BTSequenceNode extends BTCompositeNode {
  constructor (config) {
    super(Object.assign({
      title: {
        type: 'sequence',
        icon: 'sequence',
        name: 'Sequence',
        fill: '#A0522D',
        subtitles: ['sequence']
      }
    }, config))
  }
}

export default BTSequenceNode
