import Konva from 'konva'
import BTNode from './node'
import Utils from './node-utils'

class BTServiceNode extends BTNode {
  constructor (config) {
    super(Object.assign({
      fill: '#483D8B'
    }, config))
  }

  /**
   * 创建节点内容
   */
  createBody () {
    super.createBody()
    this.contents.title = this.createTitle()
  }

  /**
   * 创建标题栏
   */
  createTitle () {
    let group = new Konva.Group({
      x: 4,
      y: 0,
      draggable: false
    })

    let logo = new Konva.Path({
      x: 0,
      y: 0,
      data: Utils.svg.service,
      fill: '#dddddd'
    })
    logo.scaleX(Utils.node.iconSize * 1.0 / Utils.svg.baseSize)
    logo.scaleY(Utils.node.iconSize * 1.0 / Utils.svg.baseSize)
    group.add(logo)
  
    let title = new Konva.Text({
      x: 32,
      y: 4,
      text: 'Root',
      fontSize: 16,
      fill: '#fff'
    })
    group.add(title)

    let type = new Konva.Text({
      x: 0,
      y: 4 + Utils.node.iconSize,
      text: 'Serivce',
      fontSize: 16,
      fill: '#fff'
    })
    group.add(type)

    return group
  }

  /**
   * 
   */
  adjust() {

    super.adjust()
  }
}

export default BTServiceNode