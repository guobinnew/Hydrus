
import Aquila from '../aquila/index'
import Konva from 'konva'
import BTEntityNode from './node-entity'
import Utils from './node-utils'
import { AST_Return } from 'terser';

class BTRootNode extends BTEntityNode {
  constructor (config) {
    super(Aquila.Utils.lodash.merge({
      acceptDecorator: false,
      canMove: false,
      type: 'root',
      title: {
        icon: 'root',
        title: 'Root',
        subtitles: ['root']
      }
    }, config))
  }

  /**
   * 
   * @param {*} node 
   */
  addChild (node) {
    if (!node) {
      return
    }
    // 将原节点变为子节点
    if (this.children.length > 0) {
      let children = this.removeChildren()
      for (let child of children) {
        node.addChild(child)
      }
    } 
    super.addChild(node)
  }
 
}

export default BTRootNode
