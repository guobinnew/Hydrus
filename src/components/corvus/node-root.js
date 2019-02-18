
import Aquila from 'orion-aquila'
import Konva from 'konva'
import BTEntityNode from './node-entity'
import Utils from './node-utils'
import { AST_Return } from 'terser';

class BTRootNode extends BTEntityNode {
  constructor (config) {
    super(Aquila.Utils.lodash.merge({
      acceptDecorator: false,
      acceptService: false,
      canMove: false,
      canClose: false,
      type: 'root',
      label: {
        icon: 'root',
        title: 'Root',
        subtitles: ['root'],
        order: -2
      }
    }, config))
  }

  /**
   * 计算访问次序
   */
  updateOrder (start) {
    this.label().order(-2) // 隐藏不显示
    if (this.children.length > 0) {
      this.children[0].updateOrder(0)
    }
    this.stage().refresh()
  }

  /**
   * 
   * @param {*} child 
   * @param {*} index 
   */
  insertChild (child, index) {
    if (!child) {
      return
    }

    let parent = child.parent()
    parent.removeChild(child)

    this.addChild(child)
  }

  /**
   * 
   * @param {*} child 
   */
  addChild (child) {
    if (!child || !this.config.acceptChild) {
      return
    }

    // 将原节点变为子节点
    let children = this.removeChildren()
    this.childZone.add(child.knode())
    this.children.push(child)
    this.addChildLink()

    if (children.length > 0) {
      for (let c of children) {
        child.childZone.add(c.knode())
        child.children.push(c)
        child.addChildLink()
      }
      // 自动展开
      child.expandChildren(true)
      child.adjust({
        downward: true,
        upward: true
      })
    }

    this.adjust()
  }
}

export default BTRootNode
