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
                <p>{{item.content}}</p>
              </TimelineItem>
            </Timeline>
          </TabPane>
        </Tabs>
      </Sider>
    </Layout>
    <input type="file" id="hydrusfile" style="display: none" @change="loadLocalFile">
     <Drawer title="Script Editor" width="1024" :closable="false" v-model="scriptEditor.visible">
         <ButtonGroup class="editor-button">
          <Button icon="md-create" @click="saveScript"></Button>
        </ButtonGroup>
         <codemirror v-model="scriptEditor.code" :options="scriptEditor.options"></codemirror>
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
          parsed: null,
          code: '',
          options: {
            tabSize: 2,
            mode: 'text/javascript',
            theme: 'monokai',
            lineNumbers: true,
            line: true,
            matchBrackets: true,
          },
          visible: false
        },
        simulator: {
          loop: 1,
          isPausing: false,
          isReady: false,
          outputs: [
            {
              color: 'green',
              timestamp: 0,
              content: 'Test'
            },
            {
              color: 'green',
              timestamp: 20,
              content: 'Test Auto'
            }
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
          this.scene.stage.loadFromJson(json)
          // 检查脚本是否完整
        } else {
          this.$Message.error({
              content: 'cache is empty',
              duration: 2
          })
        } 
      },
      check () {

      },
      editScript () {
        this.scriptEditor.visible = true
      },
      clearScript () {
        this.test()
        this.scriptEditor.parsed = {}
        for( let r of this.scripts) {
          r.title = r.type + '(0)'
          r.children = []
        }
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
        this.scriptEditor.parsed = eval('(function(){' + code + ';return d})()')
        console.log('parsed', this.scriptEditor.parsed)
        // 重新生成script结构
        if (this.scriptEditor.parsed) {
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

          let root = this.scriptEditor.parsed
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
      run () {

      },
      stop () {

      },
      reset () {
        this.outputs


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
