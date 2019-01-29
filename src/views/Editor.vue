<template>
  <div class="container" v-resize="onContainerResize">
    <div id="scene"></div>
    <div class="menu">
      <el-row>
        <el-button-group>
          <el-button type="primary" icon="el-icon-edit" @click="zoomIn">Zoom In</el-button>
          <el-button type="primary" icon="el-icon-edit" @click="zoomOut">Zoom Out</el-button>
          <el-button type="primary" icon="el-icon-edit" @click="reset">Reset</el-button>
          <el-button type="primary" icon="el-icon-edit" @click="undo">Undo</el-button>
          <el-button type="primary" icon="el-icon-edit" @click="redo">Redo</el-button>
          <el-button type="primary" icon="el-icon-edit" @click="clear">Clear</el-button>

          <el-dropdown @command="handleAddCommand">
              <el-button type="danger">
                Add Node<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(val, key) in nodeTypes" :command="key">{{val}}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
        </el-button-group>
      </el-row>
    </div>
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
  margin-left: 100px;
  margin-top: 10px;
}
</style>

<script>
  import resize from 'vue-resize-directive'
  import Corvus from '../components/corvus/index'

  export default {
    data: function () {
      return {
        size: {
          width: 0,
          height: 0
        },
        scene: {
          stage: null,
          cache: null
        },
        nodeTypes: {
          selector: 'selector',
          sequence: 'sequence',
          parallel: 'parallel',
          task: 'task',
          decorator: 'decorator',
          service: 'service'
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
      this.test()

    }
  }
</script>
