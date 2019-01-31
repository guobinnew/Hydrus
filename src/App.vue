<template>
  <div id="app">
    <Layout class="tools-main">
      <Sider :collapsed-width="65" ref="aside" hide-trigger collapsible v-model="isCollapsed">
        <div class="tools-logo-menu">
          <img src="./assets/logo.png" width="36" height="36" class="tools-middle">
        </div>
        <Menu
          theme="dark"
          active-name="editor"
          :default-active="activeIndex"
          :class="menuitemClasses"
          width="auto"
          @on-select="handleSelect"
        >
          <MenuItem name="editor">
            <Icon type="ios-apps"></Icon>
            <span>行为树编辑台</span>
          </MenuItem>
          <MenuItem name="debug">
            <Icon type="ios-hammer"></Icon>
            <span>行为树调试台</span>
          </MenuItem>
        </Menu>
      </Sider>
      <Content>
        <router-view/>
      </Content>
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

.layout {
  border: 1px solid #d7dde4;
  background: #f5f7f9;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.menu-item span {
  display: inline-block;
  overflow: hidden;
  width: 0px;
  white-space: nowrap;
  vertical-align: bottom;
  transition: width 0.2s ease 0.2s;
}

.menu-item i {
  transform: translateY(5px);
  transition: font-size 0.2s ease, transform 0.2s ease;
  vertical-align: middle;
  font-size: 22px;
}

.collapsed-menu span {
  width: 0px;
  transition: width 0.2s ease;
}
.collapsed-menu i {
  transform: translateX(5px);
  transition: font-size 0.2s ease 0.2s, transform 0.2s ease 0.2s;
  vertical-align: middle;
  font-size: 22px;
}
</style>

<script>
import ElContainer from "../node_modules/element-ui/packages/container/src/main";

export default {
  components: { ElContainer },
  data() {
    return {
      isCollapse: true,
      activeIndex: "editor"
    };
  },
  computed: {
    menuitemClasses: function() {
      return ["menu-item", this.isCollapsed ? "collapsed-menu" : ""];
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      this.activeIndex = key;
      const page = {
        name: key
      };
      this.$router.replace(page);
    },
    collapsedSider() {
      this.$refs.aside.toggleCollapse()
    }
  },
  mounted: function () {
      this.collapsedSider()
      this.$forceUpdate()
  }
}
</script>
