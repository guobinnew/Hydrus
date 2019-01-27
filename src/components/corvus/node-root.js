
import Konva from 'konva'
import BTEntityNode from './node-entity'
import Utils from './node-utils'
import { AST_Return } from 'terser';

class BTRootNode extends BTEntityNode {
  constructor (config) {
    super(Object.assign({
      acceptDecorator: false,
      title: {
        type: 'root',
        icon: 'root',
        name: 'Root'
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
