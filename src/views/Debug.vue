<template>
  <div class="container" v-resize="onContainerResize">
     <Layout class="tools-main">
      <Content>
         <div id="scene"></div>
         <div class="menu">
        <Row>
        <ButtonGroup>
          <Button type="primary" icon="md-folder-open" @click="load"></Button>
          <Button type="primary" icon="md-add-circle" @click="zoomIn"></Button>
          <Button type="primary" icon="md-remove-circle" @click="zoomOut"></Button>
          <Button type="primary" icon="md-refresh-circle" @click="reset"></Button>
        </ButtonGroup>
      </Row>
    </div>
      </Content>
       <Sider ref="aside" hide-trigger class="sider" width="300">
         <Tabs>
          <TabPane label="Scripts" icon="logo-apple"> 
            <ButtonGroup>
              <Button icon="ios-color-wand-outline"  @click="editScript"></Button>
              <Button icon="ios-crop" @click="clearScript"></Button>
            </ButtonGroup>
            <Divider />
            <Tree :data="scripts" class="script-tree"></Tree>
          </TabPane>
          <TabPane label="Run" icon="logo-windows">
            <Row>
                <InputNumber :max="9999" :min="1" v-model="simulator.loop"></InputNumber>
                <Button icon="md-arrow-dropright"  @click="run"></Button>
                <Button icon="md-pause" @click="stop"></Button>
                <Button icon="md-square" @click="reset"></Button>
            </Row>
            <Divider />
            <Timeline class="output-panel">
              <TimelineItem v-for="(item,index) in simulator.outputs" :color="item.color">
                <p class="output-time">{{index}}<span>{{item.timestamp + 'ms'}}</span></p>
                <p v-for="text in item.content">{{text}}</p>
              </TimelineItem>
            </Timeline>
          </TabPane>
        </Tabs>
      </Sider>
    </Layout>
    <input type="file" id="hydrusfile" style="display: none" @change="loadLocalFile">
     <Drawer title="Script Editor" width="1024" :closable="false" v-model="scriptEditor.visible">
         <ButtonGroup class="editor-button">
          <Button icon="md-create" @click="saveScript">Save</Button>
        </ButtonGroup>
         <codemirror ref="code" v-model="scriptEditor.code" :options="scriptEditor.options"></codemirror>
    </Drawer>
  </div>
</template>

<style scoped>
.container {
  overflow: hidden;
  height: 100%;
}

#scene {
  width: 100%;
  height: 100%;
  background-color: #fff;
}

.tools-main {
  height: 100%;
  width: 100%;
}
.sider {
  background: #ddd;
}

.menu {
  position: absolute;
  top: 0;
  left: 0;
  overflow: visible;
  text-align: left;
  margin-left: 40px;
  margin-top: 10px;
}

.script-tree {
  text-align: left;
  margin-left: 12px;
}

.editor-button {
  margin-bottom: 4px;
}

.output-panel {
  text-align: left;
  margin-left: 12px;
  height: 500px;
  overflow: auto;
}
 .output-time{
    font-size: 14px;
    font-weight: bold;
  }

  .output-time span {
    margin-left: 4px;
    font-size: 12px;
    font-weight: normal;
  }

</style>

<script>
  import resize from 'vue-resize-directive'
  import FileSaver from 'file-saver'
  import LocalForage from 'localforage'
  import { codemirror } from 'vue-codemirror'
  import 'codemirror/mode/javascript/javascript'
  import 'codemirror/theme/monokai.css'
  import Corvus from '../components/corvus'
  import Aquila from '../components/aquila'
  import { FastLayer } from 'konva';

  export default {
    components: {codemirror},
    data: function () {
      return {
        size: {
          width: 0,
          height: 0
        },
        scene: {
          stage: null
        },
        scriptEditor: {
          code: '',
          options: {
            tabSize: 2,
            mode: 'text/javascript',
            theme: 'monokai',
            lineNumbers: true,
            line: true,
            matchBrackets: true,
            autofocus: true
          },
          visible: false
        },
        simulator: {
          blackboard: null,
          engine: null,
          script: null,
          tree: null,
          loop: 10,
          current: 0,
          timer: null,
          interval: 5,
          isPausing: true,
          isReady: false,
          outputs: [
          ]
        },
        scripts: [
          {
            type: 'Variables',
            title: 'Variables(0)',
            expand: true,
            children: [
            ]
          },
          {
            type: 'Decorators',
            title: 'Decorators(0)',
            expand: true,
            children: [
            ]
          },
          {
            type: 'Services',
            title: 'Services(0)',
            expand: true,
            children: [
            ]
          },
          {
            type: 'Tasks',
            title: 'Tasks(0)',
            expand: true,
            children: [
            ]
          }
        ]
      }
    },
    directives: {
      resize,
    },
    computed: {
    },
    methods: {
      onContainerResize() {
        this.size.width = this.$el.clientWidth
        this.size.height = this.$el.clientHeight
        this.scene.stage.resize(this.size.width, this.size.height)
      },
      loadLocalFile() {
        let selectedFile = this.$el.querySelector('#hydrusfile').files[0]
        let name = selectedFile.name
        let size = selectedFile.size //读取选中文件的大小
        if (size === 0){
            this.$Message.error({
              content: `File <${name}> is empty`,
              duration: 2
            })
           return
        }
        let reader = new FileReader()   

        reader.onload = () => {
          // 读取js文件
        }
        reader.readAsText(selectedFile)
      },
      load(){
        let json = this.$store.getters.internalCache
        if (json) {
          this.scene.cache = json
          this.simulator.tree = this.convert(json)
          this.scene.stage.loadFromJson(json)
          // 检查脚本是否完整
        } else {
          this.$Message.error({
              content: 'cache is empty',
              duration: 2
          })
        } 
      },
      convert (json) {
        this.simulator.tree = {}
        const actors = ['task', 'decorator', 'service']
        const walk = (node) => {
          let n = {
            type: node.type,
          }
          let idx = actors.indexOf(n.type)
          n.label = idx > 0 ? node.config.title : node.config.label.title

          // TODO 添加参数
          if (idx >= 0) {
            n.actor = {
              id: n.type === 'task' ? node.config.label.script : node.config.script
            }
          }

          // 处理孩子节点
          n.elements = []
          if (node.elements) {
            for (let elem of node.elements) {
              n.elements.push(walk(elem))
            }
          }

          n.children = []
           if (node.children) {
            for (let child of node.children) {
              n.children.push(walk(child))
            }
          }
          return n
        }
        this.simulator.tree.root = walk(json.root)
        
      },
      check () {
        // 检测Tree中脚本是否有效
        const errors = []
        if (!this.simulator.tree) {
          this.convert(this.scene.cache)
        }
        const tree = this.simulator.tree
        if (!tree || !tree.root || !this.simulator.script) {
          this.simulator.isReady = false
          this.$Notice.error({
              title: 'Tree Model Check',
              desc: 'Tree Model is null or script is invalid'
            });
          return
        }
        const actors = ['task', 'decorator', 'service']
        const validate = (node) => {
          let idx = actors.indexOf(node.type)
          if (idx >= 0) {
            let container = null
            if (idx === 0 ) {
              container = this.simulator.script.tasks
            } else if (idx === 1) {
              container = this.simulator.script.decorators 
            } else if (idx === 2) {
              container = this.simulator.script.services 
            }
            if (!container || !Aquila.Utils.common.isFunction(container[node.actor.id])) {
              errors.push({
                label: node.label,
                script: node.actor.id
              })
            }
          }

          // 处理孩子节点
          if (node.elements) {
            for (let elem of node.elements) {
              validate(elem)
            }
          }

          if (node.children) {
            for (let child of node.children) {
              validate(child)
            }
          }
        }
        validate(tree.root)

        if (errors.length > 0) {
          this.$Notice.success({
              title: 'Tree Model Check',
              duration: 0,
              render: h => {
                        let r = []
                        for( let err of errors) {
                          r.push(h('li', err.label + '->' + err.script))
                        }
                        return h('ul', r)
                    }
          });
          this.simulator.isReady = false
          return
        }
        this.simulator.isReady = true
      },
      editScript () {
        this.scriptEditor.visible = true
      },
      clearScript () {
         this.$Modal.confirm({
           content: 'Are you sure?',
           title: 'Tip', 
           okText: 'Ok',
           cancelText: 'Cancel',
           onOk: () => {
              this.test()
              this.simulator.script = {}
              for( let r of this.scripts) {
                r.title = r.type + '(0)'
                r.children = []
              }
            }
         })
      },
      saveScript () {
        let code = '' + this.scriptEditor.code
        // 剔除注释
        code = code.replace(/(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/g, '\n').replace(/(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/g, '\n')
        code = Aquila.Utils.common.trimString(code)

        if (code.length === 0) {
          code = 'const d = null'
        }

        // 解析js代码
        this.simulator.script = eval('(function(){' + code + ';return d})()')
        console.log('parsed', this.simulator.script)
        // 重新生成script结构
        if (this.simulator.script) {
          const process = (obj, index, type) => {
            if (obj) {
              let list = []
              for (const key in obj) {
                list.push({
                  type: type,
                  title: key
                })
              }
              this.scripts[index].title = this.scripts[index].type + '(' + list.length + ')'
              this.scripts[index].children = list
            }
          }

          let root = this.simulator.script
          // 克隆数据
          this.simulator.blackboard = Aquila.Utils.common.clone(this.simulator.script.data)
          process(root.data, 0, 'Variable')
          process(root.decorators, 1, 'Decorator')
          process(root.services, 2, 'Service')
          process(root.tasks, 3, 'Task')
        } else {
          for( let r of this.scripts) {
            r.title = r.type + '(0)'
            r.children = []
          }
        }
      },
      zoomIn(){
        this.scene.stage.zoomIn()
      },
      zoomOut(){
        this.scene.stage.zoomOut()
      },
      reset(){
        this.scene.stage.reset()
      },
      test () {
        this.scriptEditor.code = `
/**
* 示例代码 
* const d = { 
*    data: {
*      temperature: 1,
*    },
*    decorators: {
*      isHot: function (delta, ...) {}
*    },
*    services: {
*      find: function (delta, ...) {}
*    },
*    tasks: {
*      cooling: function (delta, ...) {}
*    }
* }
*/
`
      },
      tick () {
        console.log('tick')
        this.simulator.engine && this.simulator.engine.tick()
        this.simulator.current++
        if (this.simulator.current < this.simulator.loop) {
          this.simulator.timer = setTimeout(this.tick, this.simulator.interval)
        } else {
          this.simulator.isPausing = true
          this.simulator.current = 0
        }
      },
      run () {
        // 判断状态
        if (!this.simulator.isReady) {
          this.check()
          if (!this.simulator.isReady) {
            return
          }
          // 
          if (this.simulator.engine) {
            delete this.simulator.engine
          }

          this.simulator.engine = new Aquila.Engine({
            data: this.simulator.blackboard,
            decorators: this.simulator.script.decorators,
            services: this.simulator.script.services,
            tasks: this.simulator.script.tasks
          })
          this.simulator.engine.load(this.simulator.tree)
          this.simulator.engine.setLog((log) => {
            console.log('engine log', log)
            if (!log) {
              return
            }
            // 合并日志消息
            let msg = {
              timestamp: log.timestamp,
              content: [],
              color: 'green'
            }
            for(let l of log.logs) {
              if (l.type === 'task') {
                msg.content.push(`${l.action} Task [${l.node}]`)
              }
            }
  
            this.simulator.outputs.push(msg)
          })
        }

        // 取消暂停
        if (this.simulator.isPausing) {
          if (this.simulator.current < this.simulator.loop) {
            this.simulator.isPausing = false
            this.simulator.timer = setTimeout(this.tick, this.simulator.interval)
          }
        }
      },
      stop () {
        if (this.simulator.timer) {
          clearTimeout(this.simulator.timer)
          this.simulator.timer = null
        }
        this.simulator.isPausing = true
      },
      reset () {
        this.stop()
        this.simulator.current = 0
        this.simulator.isReady = false
        this.simulator.blackboard = Aquila.Utils.common.clone(this.simulator.script.data)
        this.simulator.outputs = []
      }
    },
    mounted: function () {
      // 随窗口动态改变大小
      this.size.width = this.$el.clientWidth
      this.size.height = this.$el.clientHeight
      this.scene.stage = Corvus.init({
        container: 'scene',    //container 用来容纳舞台的容器
        width: this.size.width,
        height: this.size.height,
        readonly: true
      })

      this.test()
      this.load()
    }
  }
</script>
