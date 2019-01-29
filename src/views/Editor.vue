<template>
  <div class="container" v-resize="onContainerResize">
    <div id="scene"></div>
    <div class="menu">
      <el-row>
        <el-button-group>
          <el-button type="primary" icon="fa fa-folder-open" @click="load"></el-button>
          <el-button type="primary" icon="fa fa-floppy-o" @click="save"></el-button>
          <el-button type="primary" icon="fa fa-cloud-download" @click="loadCache"></el-button>
          <el-button type="primary" icon="fa fa-cloud-upload" @click="saveCache"></el-button>
          <el-button type="primary" icon="fa fa-search-plus" @click="zoomIn"></el-button>
          <el-button type="primary" icon="fa fa-search-minus" @click="zoomOut"></el-button>
          <el-button type="primary" icon="fa fa-retweet" @click="reset"></el-button>
          <el-button type="primary" icon="fa fa-undo" @click="undo"></el-button>
          <el-button type="primary" icon="fa fa-repeat" @click="redo"></el-button>
          <el-button type="primary" icon="fa fa-trash " @click="clear"></el-button>

          <el-dropdown @command="handleAddCommand">
              <el-button type="danger" icon="el-icon-menu">
               <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(val, key) in nodeTypes" :command="key">{{val}}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
        </el-button-group>
      </el-row>
    </div>
    <input type="file" id="hydrusfile" style="display: none" @change="loadLocalFile">
        <el-dialog :title="dialogs.elementModel.title" :visible.sync="dialogs.elementModel.visible" :close-on-click-modal="false" width="60%">
            <EditElement :model="dialogs.elementModel" ref="editElement"></EditElement>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogs.elementModel.visible = false">Cancel</el-button>
                <el-button type="primary" @click="handleElementModel">Ok</el-button>
            </div>
        </el-dialog>
        <el-dialog :title="dialogs.entityModel.title" :visible.sync="dialogs.entityModel.visible" :close-on-click-modal="false" width="60%">
            <EditEntity :model="dialogs.entityModel" ref="editEntity"></EditEntity>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogs.entityModel.visible = false">Cancel</el-button>
                <el-button type="primary" @click="handleEntityModel">Ok</el-button>
            </div>
        </el-dialog>

  </div>
</template>

<style scoped>
.container {
  overflow: hidden;
  height: 100%;
  line-height: 40px;
}

#scene {
  width: 100%;
  height: 100%;
  background-color: #fff;
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
</style>

<script>
  import resize from 'vue-resize-directive'
  import FileSaver from 'file-saver'
  import LocalForage from "localforage"
  import Corvus from '../components/corvus/index'
  import EditElement from '../components/EditElement.vue'
  import EditEntity from '../components/EditEntity.vue'

  export default {
    components: { EditElement, EditEntity },
    data: function () {
      return {
        size: {
          width: 0,
          height: 0
        },
        scene: {
          stage: null,
          cachekey: 'hydruscache',
        },
        nodeTypes: {
          selector: 'selector',
          sequence: 'sequence',
          parallel: 'parallel',
          task: 'task',
          decorator: 'decorator',
          service: 'service'
        },
        dialogs: {
          elementModel: {
            visible: false,
            host: null,
            action: 'add',
            title: '',
            form: {
              parent: '',
              title: '',
              subtitles: [],
              type: ''
            }
          },
          entityModel: {
            visible: false,
            host: null,
            action: 'add',
            title: '',
            form: {
              parent: '',
              title: '',
              subtitles: [],
              type: ''
            }
          }
        }
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
      handleAddCommand(command) {
        // 获取当前选中节点
        let parent = this.scene.stage.selectedNode()
        if (parent && parent.isType('label')) {
          parent = parent.parent()
        }

        console.log(parent, command)

        let model = null
        if (command === 'decorator') {
          if (!parent.canAcceptDecorator()){
             this.$message.error('Selected Node can not add ' + command)
             return
          }
          model = this.dialogs.elementModel
          model.title = 'Add Decorator'
          model.form.parent = parent.labelTitle()
          model.form.subtitles = ['condition']
         
          this.dialogs.elementModel.visible = true
        } else if (command === 'service') {
          if (!parent.canAcceptService()){
             this.$message.error('Selected Node can not add ' + command)
             return
          }
          model = this.dialogs.elementModel
          model.title = 'Add Service'
          model.form.parent = parent.labelTitle()
          model.form.subtitles = [command]
        } else if (command === 'selector') {
          if (!parent.canAcceptChild()){
             this.$message.error('Selected Node can not add ' + command)
             return
          }
          model = this.dialogs.entityModel
          model.title = 'Add Selector'
          model.form.parent = parent.labelTitle()
          model.form.subtitles = [command]
        } else if (command === 'sequence') {
           if (!parent.canAcceptChild()){
             this.$message.error('Selected Node can not add ' + command)
             return
          }
          model = this.dialogs.entityModel
          model.title = 'Add Sequence'
          model.form.parent = parent.labelTitle()
          model.form.subtitles = [command]
        } else if (command === 'parallel') {
           if (!parent.canAcceptChild()){
             this.$message.error('Selected Node can not add ' + command)
             return
          }
          model = this.dialogs.entityModel
          model.title = 'Add Parallel'
          model.form.parent = parent.labelTitle()
          model.form.subtitles = [command]
        } else if (command === 'task') {
           if (!parent.canAcceptChild()){
             this.$message.error('Selected Node can not add ' + command)
             return
          }
          model = this.dialogs.entityModel
          model.title = 'Add Task'
          model.form.parent = parent.labelTitle()
          model.form.subtitles = [command]
        } else {
          this.$message.error('Unknown Command - ' + command)
          return
        }

        model.host = parent
        model.action = 'add'
        model.form.type = command
        model.visible = true
      },
      handleElementModel(){
        let model = this.dialogs.elementModel
         if (model.action === 'add'){
          // 检测合法性
          this.$refs['editElement'].validate((valid) => {
              if (valid) {
                // 添加Element
                let config = {
                  title: model.form.title,
                  subtitles: model.form.subtitles
                }
                
                if (model.form.type === 'decorator') {
                  model.host.addDecorator(config)
                } else if (model.form.type === 'service') {
                  model.host.addService(config)
                }
                this.scene.stage.refresh()
                model.visible = false
              }
          })
         } else if (action === 'edit') {
          
           this.$refs['editElement'].validate((valid) => {
             if (valid) {
              // 修改节点属性


              this.scene.stage.refresh()
              model.visible = false
             }
           })

         } else {

         }
      },
      handleEntityModel(){
        let model = this.dialogs.entityModel
         if (model.action === 'add'){
          // 检测合法性
          this.$refs['editEntity'].validate((valid) => {
              if (valid) {
                // 添加Element
                let data = {
                  type: model.form.type,
                  config: {
                    label: {
                      title: model.form.title,
                      subtitles: model.form.subtitles
                    }
                  }
                }

                let child = this.scene.stage.createEntity(data)
                model.host.addChild(child)
                this.scene.stage.refresh()
                model.visible = false
              }
          })
         } else if (action === 'edit') {
          
           this.$refs['editEntity'].validate((valid) => {
             if (valid) {
              // 修改节点属性


              this.scene.stage.refresh()
              model.visible = false
             }
           })

         } else {

         }
      },
      loadLocalFile() {
        let selectedFile = this.$el.querySelector('#hydrusfile').files[0]
        let name = selectedFile.name
        let size = selectedFile.size //读取选中文件的大小
        if (size === 0){
            this.$message({
              message: `File <${name}> is empty`,
              type: 'error',
              duration: 2000
            })
           return
        }
        let reader = new FileReader()   

        reader.onload = () => {
          let json = JSON.parse(reader.result)
          this.scene.stage.loadFromJson(json)
        }
        reader.readAsText(selectedFile)
      },
      load(){
        this.$el.querySelector('#hydrusfile').click()
      },
      save(){
        this.scene.cache = this.scene.stage.saveToJson()
        console.log(this.scene.cache)
        // 保存到本地文件
        let filename = this.scene.cache.root.config.label.title
        let blob = new Blob([JSON.stringify(this.scene.cache)], {type: "text/plain;charset=utf-8"})
        FileSaver.saveAs(blob, filename + ".json")
      },
      loadCache(){
        LocalForage.getItem(this.scene.cachekey, (err, value) => {
          if (err) {
            this.$message({
              message: 'Cache data is empty',
              type: 'warning',
              duration: 2000
            })
            return
          }
          let json = JSON.parse(value)
          this.scene.stage.loadFromJson(json)
        })
      },
      saveCache(){
        let json = this.scene.stage.saveToJson()
        LocalForage.setItem(this.scene.cachekey, JSON.stringify(json), (err) => {
          if (err) {
            this.$message({
              message: 'Save failed',
              type: 'error',
              duration: 2000
            })
            return
          }

          this.$message({
            message: 'Save success',
            type: 'success',
            duration: 2000
          })
        })
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
      undo(){

      },
      redo(){

      },
      clear(){
        this.scene.stage.clear()
      },
      test(){
        // Demo Tree JSON
        const demo = {
          root: {
            type: 'selector',
            config: {
              label: {
                title: '战士AI'
              }
            },
            children: [
              {
                type: 'sequence',
                config: {
                  label: {
                    title: '驾驶'
                  }
                },
                children: [
                  {
                    type: 'task',
                    config: {
                      label: {
                        title: '驾驶汽车'
                      },
                    },
                    elements: [
                      {
                        type: 'decorator',
                        config: {
                          title: '5米距离内有汽车'
                        }
                      }
                    ]
                  }
                ]
              },
              {
                type: 'sequence',
                config: {
                  label: {
                    title: '撤退'
                  }
                },
                children: [
                  {
                    type: 'selector',
                    config: {
                      label: {
                        title: '或'
                      }
                    },
                    elements: [
                      {
                        type: 'decorator',
                        config: {
                          title: '我方人数小于3'
                        }
                      },
                      {
                        type: 'decorator',
                        config: {
                          title: '敌方人数倍数大于5'
                        }
                      }
                    ]
                  },
                  {
                    type: 'task',
                    config: {
                      label: {
                        title: '撤退'
                      }
                    }
                  }
                ]
              },
              {
                type: 'selector',
                config: {
                  label: {
                    title: '自卫'
                  }
                },
                children: [
                  {
                    type: 'sequence',
                    config: {
                      label: {
                        title: '使用手雷'
                      }
                    },
                    elements: [
                      {
                        type: 'decorator',
                        config: {
                          title: '前方15米内敌方人数小于4'
                        }
                      }
                    ],
                    children: [
                      {
                        type: 'task',
                        config: {
                          label: {
                            title: '扔手雷'
                          }
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }

        let sel1 = this.scene.stage.addSelectorNode()

        let dec = sel1.addDecorator({
          title: 'AAA',
          subtitles: ['zzzz']
        })
    
        let dec2 = sel1.addDecorator({
          title: 'CCC',
          subtitles: ['cccccc:sdffd']
        })
   
        let ser = sel1.addService({
          title: 'BBB',
          subtitles: ['xxzz: sdfsf']
        })
    
        this.scene.stage.addSelectorNode({
          parent: sel1.id()
        })
        this.scene.stage.addSequenceNode({
          parent: sel1.id()
        })

        let sel2 = this.scene.stage.addSelectorNode()
        this.scene.stage.addTaskNode({
          parent: sel2.id()
        })

        this.scene.stage.addParallelNode()
        
        // 从文件加载
        this.scene.stage.loadFromJson(demo)
        this.scene.stage.refresh()

      }
    },
    mounted: function () {
      // 随窗口动态改变大小
      this.size.width = this.$el.clientWidth
      this.size.height = this.$el.clientHeight

      this.scene.stage = Corvus.init({
        container: 'scene',    //container 用来容纳舞台的容器
        width: this.size.width,
        height: this.size.height
      })

      // 测试
      //this.test()
    }
  }
</script>
