<template>
  <div id="app">
      <Layout class="tools-main">
            <Header>
                <Menu mode="horizontal" theme="dark" active-name="editor" @on-select="handleSelect">
                    <div class="layout-logo">
                        <img src="./assets/logo.png" width="36" height="36">
                    </div>
                    <div class="layout-title">
                        Hydrus
                    </div>
                    <div class="layout-nav">
                        <MenuItem name="editor">
                            <Icon type="ios-apps"></Icon>
                            Editor
                        </MenuItem>
                         <MenuItem name="debug">
                             <Icon type="ios-hammer"></Icon>
                            Debug
                        </MenuItem>
                    </div>
                </Menu>
            </Header>
            <router-view/>
    </Layout>
  </div>
</template>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.tools-main {
  height: 100%;
  width: 100%;
}

.layout{
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    height: 100%;
}
.layout-logo{
    width: 40px;
    height: 40px;
    border-radius: 3px;
    float: left;
    position: relative;
    top: 15px;
    left: 20px;
}

.layout-title {
    width: 100px;
    height: 40px;
    color: #fff;
    float: left;
    line-height: 40px;
    position: relative;
    top: 15px;
}

.layout-nav{
    width: 420px;
    margin: 0 auto;
    margin-right: 20px;
}

.CodeMirror {
  border: 1px solid #eee;
  height: 600px;
}

</style>

<script>
import ElContainer from "../node_modules/element-ui/packages/container/src/main";

export default {
  components: { ElContainer },
  data() {
    return {
      activeIndex: "editor",
    }
  },
  computed: {
  },
  methods: {
    handleSelect(key, keyPath) {
      this.activeIndex = key;
      const page = {
        name: key
      };
      this.$router.replace(page);
    },
  },
  mounted: function () {
  }
}
</script>
