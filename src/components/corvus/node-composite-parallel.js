import BTCompositeNode from './node-composite'

class BTParallelNode extends BTCompositeNode {
  constructor (config) {
    super(Object.assign({
      title: {
        type: 'parallel',
        icon: 'parallel',
        name: 'Parallel',
        fill: '#EE2C2C',
        subtitles: ['parallel']
      }
    }, config))
  }
}

export default BTParallelNode
