<template>
    <div class="container" v-resize="onContainerResize">
        <div id="scene"></div>
        <div class="menu">
            <el-row>
                <el-button-group>
                    <el-button type="primary" icon="el-icon-edit" @click="zoomIn">Zoom In</el-button>
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
      zoomIn(){

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

      
    }
  }
</script>
