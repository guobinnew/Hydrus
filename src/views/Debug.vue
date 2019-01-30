<template>
  <div class="container" v-resize="onContainerResize">
    <div id="scene"></div>
    <div class="menu">
      <el-row>
        <el-button-group>
          <el-button type="primary" icon="fa fa-folder-open" @click="load"></el-button>
        </el-button-group>
      </el-row>
    </div>
    <input type="file" id="hydrusfile" style="display: none" @change="loadLocalFile">
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
  import Corvus from '../components/corvus'
  import Aquila from '../components/aquila'

  export default {
    components: {},
    data: function () {
      return {
        size: {
          width: 0,
          height: 0
        },
        scene: {
          stage: null,
          cachekey: 'hydruscache',
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
      zoomIn(){
        this.scene.stage.zoomIn()
      },
      zoomOut(){
        this.scene.stage.zoomOut()
      },
      reset(){
        this.scene.stage.reset()
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
    }
  }
</script>
