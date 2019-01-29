<template>
    <div id="app">
        <el-container class="tools-main">
            <el-aside width="65px">
                <div class="tools-logo-menu">
                    <img src="./assets/logo.png" width="36" height="36" class="tools-middle"/>
                </div>
                <el-menu :default-active="activeIndex" class="el-menu-vertical" @select="handleSelect"
                         :collapse="isCollapse">
                    <el-menu-item index="editor">
                        <i class="el-icon-location"></i>
                        <span slot="title">行为树编辑台</span>
                    </el-menu-item>
                    <el-menu-item index="debug">
                        <i class="el-icon-setting"></i>
                        <span slot="title">行为树调试台</span>
                    </el-menu-item>
                </el-menu>
            </el-aside>
            <el-container>
                <el-main>
                    <router-view/>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<style lang="scss">
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        height: 100%;
        width: 100%;
    }

    #nav {
        padding: 30px;
        a {
            font-weight: bold;
            color: #2c3e50;
            &.router-link-exact-active {
                color: #42b983;
            }
        }
    }

    .tools-main {
        height: 100%;
        width: 100%;
    }

    .tools-logo-menu {
        height: 58px;
        text-align: center;
        padding: 0;
    }

    .tools-middle {
        display: inline-block;
        vertical-align: middle;
    }

    .el-menu-vertical {
        height: 100%;
    }

    .el-header, .el-footer {
        background-color: #B3C0D1;
        color: #333;
        text-align: center;
        line-height: 60px;
        padding: 0;
    }

    .el-aside {
        color: #333;
        text-align: center;
        line-height: 58px;
        overflow: hidden;
    }

    .el-main {
        background-color: #E9EEF3;
        color: #333;
        text-align: center;
        padding: 0;
        height: 100%;
    }

    body > .el-container {
        margin-bottom: 40px;
    }

    .el-container:nth-child(5) .el-aside,
    .el-container:nth-child(6) .el-aside {
        line-height: 260px;
    }

    .el-container:nth-child(7) .el-aside {
        line-height: 320px;
    }

    .el-dialog {
      line-height: 40px;
    }

    .el-footer{
        text-align: right;
        padding-right: 20px;
        color: #666;
    }

    .el-upload {
      width: 100%;
    }

    .el-select {
        width: 100%;
    }
</style>

<script>
  import ElContainer from '../node_modules/element-ui/packages/container/src/main'

  export default {
    components: {ElContainer},
    data () {
      return {
        isCollapse: true,
        activeIndex: 'editor'
      }
    },
    methods: {
      handleSelect (key, keyPath) {
        this.activeIndex = key
        const page = {
           name: key
        }
        this.$router.replace(page)
      }
    }
  }
</script>
