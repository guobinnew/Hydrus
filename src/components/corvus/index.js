import BTStage from './stage'

const Corvus = {
  /**
   * 创建编辑面板
   * @param options
   * {
   *    container: 'scene',    //用来容纳的DOM节点Id（必须有）
   *    width:  // canvas宽度（必须有）
   *    height: // canvas高度（必须有）
   *    draggable: false  // 是否允许内容拖放
   *    canZoom: true,  // 是否允许缩放
   *    canWheelZoom: true // 是否允许滚轮缩放
   *    readonly: false // 只读模式
   *    debug: false // debug模式（仅允许编辑脚本参数) 
   * }
   * @returns {Stage}
   */
  init: function (options) {
    return new BTStage(options)
  }
}

export default Corvus
