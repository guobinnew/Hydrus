import konva from 'konva'
import uniqid from 'uniqid'
import BTEntityNode from './node-entity'
import BTRootNode from './node-root'
import BTSelectorNode from './node-composite-selector'
import BTSequenceNode from './node-composite-sequence'
import BTTaskNode from './node-task'


/**
 * 编辑面板
 */
class Stage {
  constructor(options) {
    this.options = {
      draggable: true,
      canZoom: true
    }
    _.merge(this.options, options)
    this.stage = new konva.Stage(this.options)
    this.stage.setAttr('btstage', this)

    this.layers = {}
    // 创建图层
    this.modelIndex = {}
    this.layers.model = new konva.Layer()
    this.stage.add(this.layers.model)

    // 连线层
    this.linkIndex = {}
    this.layers.link = new konva.Layer()
    this.stage.add(this.layers.link)

    // 拖放层
    this.dragNode = null
    this.layers.drag = new konva.Layer()
    this.stage.add(this.layers.drag)

    // 是否被修改
    this.modified = false

    // 当前鼠标位置
    this.mousePos = {
      x: 0,
      y: 0
    }

    // 是否允许缩放
    this.zoom = 1.0
    this.minZoom = 0.1
    this.maxZoom = 10
    this.zoomFactor = 1.25

    // 操作列表（用于Undo， Redo）
    this.maxAction = 50
    this.actions = []
    // 当前操作列表游标索引
    this.actionIndex = -1

    // 根节点
    this.addRootNode()

    // 鼠标事件
    let stage = this
    this.stage.on('mousedown', (evt) => {
      let shape = evt.target
    })

    this.stage.on('mouseup', (evt) => {

    })

    this.stage.on('mousemove', (evt) => {
      stage.mousePos = stage.stage.getPointerPosition();
    })

    this.stage.on('dragstart', (evt) => {
      if (stage.isLinking) {
        return
      }
      let target = evt.target
      if (target instanceof konva.Group) {
        let group = target
      }
    })

    this.stage.on('dragmove', (evt) => {
      
      let target = evt.target
      if (target instanceof konva.Group) {
        let group = target
        stage.layers.link.batchDraw()
      }
    })

    this.stage.on('dragend', (evt) => {
      let target = evt.target
    })

    this.update()
  }

  /**
   * 缓冲快照
   */
  snapshot() {

    if (this.actions.length >= this.maxAction) {
      this.actions.splice(0, 1)
    }

    // 一旦添加快照，删除当前undo队列后续缓存
    if (this.actionIndex >= 0 && this.actionIndex < this.actions.length - 1) {
      this.actions.splice(this.actionIndex + 1, this.actions.length - this.actionIndex - 1)
    }

    let cache = this.saveToJson()
    this.actions.push(cache)
    this.actionIndex = this.actions.length - 1
  }

  /**
   * 刷新显示
   */
  update () {
    this.stage.draw()
  }

  /**
   * 查找所在Group对象
   * @param shape
   * @param type 类型
   * @returns {*}
   */
  findGroupParent (shape, type) {
    let parent = null
    // 如果自己满足条件，返回自己
    if (shape instanceof konva.Group) {
      if (!type || (type.length > 0 && shape.hasName(type))) {
        parent = shape
        return
      }
    }

    let groups = this.stage.find('Group')
    for (let i = 0; i < groups.length; i++) {
      if (groups[i] === shape) {
        continue
      }

      if (type.length > 0 && !groups[i].hasName(type)) {
        continue
      }

      if (groups[i].isAncestorOf(shape)) {
        parent = groups[i]
        break
      }
    }
    return parent
  }

  /**
   * 添加根节点
   */
  addRootNode () {
    this.root = new BTRootNode({
      x: this.stage.width() / 2,
      y: this.stage.height() / 2
    })
    this.layers.model.add(this.root.node())
    console.log(this.root)
  }

  /**
   * 添加Selector节点
   * @param {*} config 
   */
  addSelectorNode (option) {
    let parent = this.getNode(option.parentId)
    let node = new BTSelectorNode(option.config)
    parent.addChild(node)
  }

  /**
   * 添加Sequence节点
   * @param {*} config 
   */
  addSequenceNode (option) {
    let parent = this.getNode(option.parentId)
    let node = new BTSequenceNode(option.config)
    parent.addChild(node)
  }

   /**
   * 添加Sequence节点
   * @param {*} config 
   */
  addTaskNode (option) {
    let parent = this.getNode(option.parentId)
    let node = new BTTaskNode(option.config)
    parent.addChild(node)
  }

  /**
   * 根据ID获取Node
   * @param {*} uid 
   */
  getNode (uid) {
    if (uid) {
      let nodes = this.layers.model.find('#' + uid)
      if (nodes.length > 0) {
        if (nodes.length !== 1) {
          Aquila.Logger.warn(`Stage::getNode - Node <${uid}> is not unique`)
        }
        let node = nodes[0].getAttr('btnode')
        if (node instanceof BTEntityNode) {
          return node
        } else {
          Aquila.Logger.error(`Stage::getNode - Node <${uid}> is not BTEnittyNode`)
        }
      }
    }
    return this.root
  }

  /**
   * 更新节点访问次序
   */
  updateOrder () {

  }

  /**
   * 添加连线
   * @param config
   * {
   *   start: konva.Group  起始端口（必须是outport类型）
   *   end: konva.Group 终止端口（必须是inport类型）
   *   points: array[number] 连线的坐标点数组（共4个坐标点，连线为贝塞尔曲线，2个顶点 + 2个控制点）
   * }
   * @returns {konva.Line}
   */
  addLink(config) {
    const stage = this
    let lid = uniqid()

    let points = config.points
    if (!points || points.length < 8) {
      // 计算绝对坐标
      let outpos = config.start.getAbsolutePosition(this.stage)
      // 计算绝对坐标
      let inpos = config.end.getAbsolutePosition(this.stage)
      if (outpos.x < inpos.x) {
        points = [outpos.x, outpos.y, outpos.x + 100, outpos.y, inpos.x - 100, inpos.y, inpos.x, inpos.y]
      } else {
        points = [outpos.x, outpos.y, outpos.x + 100, outpos.y + 100, inpos.x - 100, inpos.y + 100, inpos.x, inpos.y]
      }
    }

    let line = new konva.Line({
      points: points,
      stroke: '#89abd2',
      strokeWidth: 2,
      lineCap: 'round',
      lineJoin: 'round',
      bezier: true,
      id: lid
    })

    const bindPort = (port, type) => {
      let links = port.getAttr('linkids')
      if (!links) {
        links = [lid]
      } else {
        links.push(lid)
      }
      port.setAttr('linkids', links)

      let portDef = port.getAttr('portdef')
      let model = this.findGroupParent(port, 'model')

      line.setAttr('link' + type, {
        mid: model.id(),
        port: portDef.name
      })
    }
    bindPort(config.start, 'start')
    bindPort(config.end, 'end')

    line.on('mouseover', function () {
      this.setAttr('stroke', '#ccc')
      stage.layers.link.draw()
    })

    line.on('mouseout', function (evt) {
      this.setAttr('stroke', '#89abd2')
      stage.layers.link.draw()
    })

    line.on('mouseup', function (evt) {
      if (stage.selectedLine === evt.target) {
        return
      }

      if (stage.selectedLine) {
        let mod = stage.selectedLine.getAttr('linkmod')
        if (mod) {
          stage.snapshot()
          stage.selectedLine.setAttr('linkmod', false)
        }
        stage.hideAnchor()
      }

      stage.selectedLine = evt.target
      let line = evt.target
      stage.buildLineAnchor(line)
      stage.layers.link.draw()
    })

    stage.linkIndex[lid] = line
    stage.layers.link.add(line)
    return line
  }

  /**
   *
   * @param opt
   */
  addLinkFromJson (opt) {
    let startModel = this.modelIndex[opt.start.mid]
    let start = startModel.outport(opt.start.port)
    let endModel = this.modelIndex[opt.end.mid]
    let end = endModel.inport(opt.end.port)
    return this.addLink({
      start: start,
      end: end,
      points: opt.points
    })
  }

  /**
   * 创建模型
   * @param config
   * {
   *   uid:  模型唯一ID
   *   x: X坐标
   *   y: Y坐标
   *   title: 模型标题
   *   name: 模型ID名
   *   ports: [ 端口列表
   *     {
   *       orientation: in \ out  端口方向
   *       external: true 是否暴露给外部
   *       name: 端口ID
   *       title: 端口标题
   *       dataType: 数据类型
   *     }
   *   ]
   * }
   *
   * @returns {konva.Group}
   */
  addModel (config) {
    const stage = this

    const cornerRadius = 4
    const shadowOffset = 4
    const clipOffsetX = 20
    const headHeight = 58
    const minWidth = 140
    const minContentHeight = 60

    let cfg = { uid: uniqid() }
    _.merge(cfg, config)

    // 创建模型
    let group = new konva.Group({
      x: cfg.x,
      y: cfg.y,
      draggable: true,
      name: 'model',
      id: cfg.uid
    })

    group.on('mouseover', function () {
      document.body.style.cursor = 'pointer'
    })

    group.on('mouseout', function () {
      document.body.style.cursor = 'default'
    })

    group.setAttr('modeldef', cfg)

    //头部
    let head = new konva.Group({
      x:0,
      y:0,
      name: 'modelhead',
      clip: {
        x : -clipOffsetX,
        y : -cornerRadius,
        width : minWidth + clipOffsetX * 2,
        height : headHeight + cornerRadius
      }
    })
    group.add(head)

    // 背景图形
    let headbg = new konva.Rect({
      x: 0,
      y: 0,
      width: minWidth,
      height: headHeight + cornerRadius,
      fill: '#406b95',
      stroke: '#d2e8ff',
      strokeWidth: 1,
      cornerRadius: cornerRadius,
      shadowColor: 'black',
      shadowBlur: 10,
      shadowOffset: {
        x: shadowOffset,
        y: shadowOffset
      },
      shadowOpacity: 0.6,
      name: 'modelbg'
    })
    head.add(headbg)

    // 标题
    let title = new konva.Text({
      x: 14,
      y: 12,
      text: config.title + (config.version ? '   ' + config.version : ''),
      fontSize: 14,
      fill: '#fff'
    })
    head.add(title)

    // Name
    let name = new konva.Text({
      x: 14,
      y: 30,
      text: config.name,
      fontSize: 12,
      fill: '#fff'
    })
    head.add(name)

    // 删除按钮
    let close = stage.buildCloseButton({
      x: minWidth - 10,
      y: 10,
      size: 14,
      uid: cfg.uid,
      action: function (evt) {
        // 删除当前模型
        let group = stage.findGroupParent(evt.target, 'modelclose')
        let pid = group.getAttr('pid')
        stage.removeModel(pid)
        stage.snapshot()
        stage.update()
      }
    })
    head.add(close)

    // 内容
    let content = new konva.Group({
      x:0,
      y:58,
      name: 'modelhead',
      clip: {
        x : -clipOffsetX,
        y : 0,
        width : minWidth + clipOffsetX * 2,
        height : minContentHeight + clipOffsetX
      }
    })
    group.add(content)

    // 背景图形
    let contentbg = new konva.Rect({
      x: 0,
      y: -cornerRadius * 2,
      width: minWidth,
      height:  minContentHeight + cornerRadius,
      fill: '#f3faff',
      stroke: '#d2e8ff',
      strokeWidth: 1,
      cornerRadius: cornerRadius,
      shadowColor: 'black',
      shadowBlur: 10,
      shadowOffset: {
        x: shadowOffset,
        y: shadowOffset
      },
      shadowOpacity: 0.6,
      name: 'modelbg'
    })
    content.add(contentbg)

    // 绑定端口消息
    const bindPortEvent = (port) => {
      port.on('mouseover', function (evt) {
        let shape = evt.target
        shape.setAttr('fill', '#ccc')
        stage.layers.model.draw()
      })
      port.on('mouseout', function (evt) {
        let shape = evt.target
        let fill = shape.getAttr('portfill')
        shape.setAttr('fill', fill)
        stage.layers.model.draw()
      })
      port.on('mouseup', function (evt) {
        evt.cancelBubble = true
        let shape = evt.target
        let port = shape.getParent()

        if (stage.isLinking) {

          if (port === stage.linePorts[0]) {
            return
          }

          // 检测类型
          if (port.hasName('modelinport') && stage.linePorts[0].hasName('modelinport')) {
            return
          }

          if (port.hasName('modeloutport') && stage.linePorts[0].hasName('modeloutport')) {
            return
          }

          // 不能是同一个父模型
          if( stage.findGroupParent(port, 'model') === stage.findGroupParent(stage.linePorts[0], 'model')){
            return
          }

          let start = null
          let end = null

          if (port.hasName('modelinport')) {
            start = stage.linePorts[0]
            end = port
          } else {
            start = port
            end = stage.linePorts[0]
          }

          // 不能重复添加
          if(stage.hasLink(start, end)){
            return
          }

          // 添加连线
          stage.addLink({
            start:start,
            end: end
          })
          stage.tempLine.setAttr('visible', false)
          stage.isLinking = false
          stage.linePorts = []
          stage.snapshot()

        } else {
          // 进入连线模式
          stage.isLinking = true
          stage.linePorts[0] = port
          let pos = port.getAbsolutePosition(stage.stage)
          let pts = [pos.x, pos.y, pos.x, pos.y]
          stage.tempLine.setAttr('points', pts)
          stage.tempLine.setAttr('visible', true)
          stage.updateTempLine()
        }
        stage.layers.link.draw()
      })
    }

    // 创建端口
    let optionModel = stage.options.model
    const createPort = (opt) => {
      let port = new konva.Group({
        x: 0,
        y: 0,
        name: opt.orientation === 'in' ? 'modelinport' : 'modeloutport',
      })
      port.setAttr('portdef', opt)

      // 计算端口类型hash
      let hashstr = opt.name + opt.datatype + ( opt.version ? opt.version : '')
      port.setAttr('hash', stringhash(hashstr))

      let portColor = opt.orientation === 'in' ? '#e17e1b' : '#00951b'
      let rect = new konva.Rect({
        x: 0,
        y: 0,
        width: 16,
        height: 12,
        fill: portColor,
        stroke: portColor,
        strokeWidth: 1
      });
      rect.setAttr('portfill', portColor)
      port.add(rect)

      let title = new konva.Text({
        x: 0,
        y: 0,
        text: opt[optionModel.portName],
        fontSize: 14,
        fill: '#333'
      })
      port.add(title)

      let ext = null
      if (opt.external) {
        ext = new konva.Wedge({
          x: 0,
          y: 0,
          radius: 6,
          angle: 180,
          fill: portColor,
          stroke: portColor,
          strokeWidth: 1,
          rotation: opt.orientation === 'in' ? 90 : -90
        })
        port.add(ext)
      }

      let datatype = new konva.Text({
        x: 0,
        y: 0,
        text: opt.datatype + ( opt.version ? '  ' + opt.version : ''),
        fontSize: 12,
        fill: '#333',
        visible: optionModel.showDataType
      })
      port.add(datatype)

      // 调整位置
      if (opt.orientation === 'in') {
        ext && ext.position({
          x: -1,
          y: 0
        })

        rect.position({
          x: 1,
          y: -6
        })

        title.position({
          x: 20,
          y: -7
        })

        datatype && datatype.position({
          x: 20,
          y: 7
        })
      } else {
        ext && ext.position({
          x: 1,
          y: 0
        })

        rect.position({
          x: -17,
          y: -6
        })

        title.position({
          x: -20 - title.getWidth(),
          y: -7
        })

        datatype.position({
          x: -20 - datatype.getWidth(),
          y: 7
        })
      }

      // 记录最大宽度
      port.setAttr('portwidth', Math.max(title.getWidth(), datatype.getWidth()))
      bindPortEvent(rect)
      return port
    }

    // 端口分类
    let inports = []
    let outports = []
    let maxPortWidth = {
      inport: 24,
      outport: 24
    }
    if (cfg.ports && cfg.ports.length > 0) {
      for( let p of cfg.ports) {
        let port = createPort(p)
        let w = +port.getAttr('portwidth')
        content.add(port)
        if (p.orientation === 'in') {
          maxPortWidth.inport = Math.max(maxPortWidth.inport, w)
          inports.push(port)
        } else {
          maxPortWidth.outport = Math.max(maxPortWidth.outport, w)
          outports.push(port)
        }
      }
    }
    let maxContentHeight = Math.max(60, Math.max(inports.length, outports.length) * 30 + 16 )
    let headWidth = Math.max(title.getWidth(), name.getWidth() + 16)
    let contentWidth = maxPortWidth.inport + maxPortWidth.outport + 60
    let maxWidth = Math.max(140, Math.max(headWidth, contentWidth))

    // 调整布局
    head.clipWidth(maxWidth + clipOffsetX * 2)
    headbg.width(maxWidth)
    close.position({
      x: maxWidth - 10,
      y: 10
    })

    content.clipWidth(maxWidth + clipOffsetX * 2)
    content.clipHeight(maxContentHeight + clipOffsetX)
    contentbg.size({
      width: maxWidth,
      height: maxContentHeight
    })

    let offsety = 16
    for(let inp of inports) {
      inp.position({
        x: 0,
        y: offsety
      })
      offsety += 30
    }

    offsety = 16
    for(let outp of outports) {
      outp.position({
        x: maxWidth,
        y: offsety
      })
      offsety += 30
    }

    stage.layers.model.add(group)
    stage.modelIndex[cfg.uid] = group
    return group
  }

  /**
   *
   * @param opt
   */
  addModelFromJson (opt) {
    this.addModel(opt)
  }

  /**
   * 删除连线
   * @param lid
   */
  removeLink (lid) {
    let l = this.linkIndex[lid]
    if (!l) {
      return
    }

    const removeId = (attr) => {
      let def = l.getAttr('link' + attr)
      let m = this.modelIndex[def.mid]

      if (m) {
        let port = attr === 'start' ? m.outport(def.port) : m.inport(def.port)
        let links = port.getAttr('linkids')
        if (links) {
          links.splice(links.indexOf(lid), 1)
        }
        port.setAttr('linkids', links)
      }
    }

    removeId('start')
    removeId('end')

    delete this.linkIndex[lid]
    l.destroy()
  }

  clearModelLink (model) {
    if (model instanceof konva.Group) {
      let group = model

      let inports = group.find('.modelinport')
      inports.each((shape) => {
        let links = shape.getAttr('linkids')
        if (links && links.length > 0) {
          for (let lid of links) {
            this.removeLink(lid)
          }
        }
      })

      let outports = group.find('.modeloutport')
      outports.each((shape) => {
        let links = shape.getAttr('linkids')
        if (links && links.length > 0) {
          for (let lid of links) {
            this.removeLink(lid)
          }
        }
      })
    }
  }

  /**
   * 删除模型
   * @param mid
   */
  removeModel (mid) {
    if (this.modelIndex[mid]) {
      let m = this.modelIndex[mid]
      delete this.modelIndex[mid]
      // 删除连线
      this.clearModelLink(m)
      // 删除模型
      m.destroy()
    }
  }

  /**
   * 改变大小
   * @param w
   * @param h
   */
  resize (w, h) {
    w && this.stage.width(w)
    h && this.stage.height(h)
    this.stage.draw()
  }

  /**
   * 放大
   */
  zoomIn () {
    if (!this.options.canZoom) {
      return
    }
    this.zoom = _.clamp(this.zoom * this.zoomFactor, this.minZoom, this.maxZoom)
    this.stage.scale({x: this.zoom, y: this.zoom})
    this.update()
  }

  zoomOut () {
    if (!this.options.canZoom) {
      return
    }
    this.zoom = _.clamp(this.zoom / this.zoomFactor, this.minZoom, this.maxZoom)
    this.stage.scale({x: this.zoom, y: this.zoom})
    this.update()
  }

  reset () {
    this.zoom = 1.0
    this.stage.scale({
      x: this.zoom,
      y: this.zoom
    })
    this.stage.position({
      x: 0,
      y: 0
    })
    this.update()
  }

  /**
   * 清空编辑器，不能撤销
   * @param cache boolean 是否清除快照缓冲
   */
  clear (cache = true) {
    // 是否被修改
    this.modified = false
    // 当前选中连线
    this.selectedLine = null
    // 新连线端口
    this.linePorts = []
    // 是否处于连线状态
    this.isLinking = false
    this.hideAnchor()

    // 清除缓存
    if (cache) {
      this.actions = []
      // 当前操作列表游标索引
      this.actionIndex = -1
    }

    for(let lid of Object.keys(this.linkIndex)) {
      this.removeLink(lid)
    }
    for(let mid of Object.keys(this.modelIndex)) {
      this.removeModel(mid)
    }

    this.modelIndex = {}
    this.linkIndex = {}

    this.update()
  }

  /**
   * 加载模型
   * @param data 快照数据
   * @param cache  boolean 是否清除快照缓冲
   */
  loadFromJson(data, cache = true) {
    // 清空面板
    this.clear(cache)

    if(!data){
      return
    }

    // 加载模型
    if (data.models){
      for(let m of data.models){
        this.addModelFromJson(m)
      }
    }

    // 加载连线
    if (data.links){
      for(let l of data.links){
        this.addLinkFromJson(l)
      }
    }

    // 如果清除之前缓存，则重新构建新缓存
    if(cache){
      this.snapshot()
    }

    this.update()
  }

  /**
   * 保存模型
   */
  saveToJson() {
    let json = {
      models:[],
      links:[]
    }
    return json
  }

  /**
   * 是否有undo
   * @returns {boolean}
   */
  hasUndo() {
    return this.actions.length > 1 && this.actionIndex > 0
  }

  /**
   * 撤销
   */
  undo() {
    if (this.actions.length <= 1) {
      this.actionIndex = this.actions.length - 1
      return
    }

    if (this.actionIndex < 0) {
      this.actionIndex = this.actions.length - 1
    }

    if (this.actionIndex > 0) {
      this.actionIndex -= 1
      let cache = this.actions[this.actionIndex]
      // 加载之前缓冲（保留缓冲队列）
      this.loadFromJson(cache, false)
    }
  }

  /**
   * 是否有redo
   * @returns {boolean}
   */
  hasRedo() {
    return this.actionIndex >= 0 && (this.actionIndex < this.actions.length - 1)
  }

  /**
   * 重做
   */
  redo() {
    if (this.actionIndex < 0) {
      return
    }

    if (this.actionIndex < this.actions.length - 1) {
      this.actionIndex += 1
      let cache = this.actions[this.actionIndex]
      // 加载之前缓冲（保留缓冲队列）
      this.loadFromJson(cache, false)
    }
  }

  /**
   * 自动连线
   * 必须端口名、数据类型+版本完全一致
   */
  autoLink() {
    // 遍历模型
    let ports = {}
    for(let m of Object.values(this.modelIndex)) {
      // 检测每个模型的输出
      let outports = m.outports()
      for (let p of outports) {
        let hash = p.getAttr('hash')
        if (!ports[hash]) {
          ports[hash] = {
            in: [],
            out: []
          }
        }
        ports[hash].out.push(p)
      }

      let inports = m.inports()
      for (let p of inports) {
        let hash = p.getAttr('hash')
        if (!ports[hash]) {
          ports[hash] = {
            in: [],
            out: []
          }
        }
        ports[hash].in.push(p)
      }
    }

    let modified = false
    for(let p of Object.values(ports)) {
      // 添加连接
      if (p.in.length === 0 || p.out.length === 0) {
        continue
      }

      // 全连接
      for( let start of p.out) {
        for( let end of p.in) {
          // 不能是同一个父模型
          if( this.findGroupParent(start, 'model') === this.findGroupParent(end, 'model')){
            continue
          }

          // 不能重复添加
          if(this.hasLink(start, end)) {
            continue
          }

          modified = true
          this.addLink({
            start: start,
            end: end
          })
        }
      }
    }

    this.layers.link.draw()
    modified && this.snapshot()
  }
}

export default Stage