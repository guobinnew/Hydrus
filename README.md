# Hydrus

基于Canvas的可视化行为树编辑工具，包含编辑和调试2大模块，
+ 编辑模块：提供可视化行为树编辑功能
+ 调试模块：提供JS代码加载绑定和运行功能，查看输出日志和Blackboard变量值

![image](https://github.com/guobinnew/Hydrus/blob/master/screenshots/editor.png?raw=true)

## 编译

```
npm install -g vue-cli
git clone https://github.com/guobinnew/Hydrus.git
npm install
npm run serve
```

## 使用说明

### 编辑器

![image](https://github.com/guobinnew/Hydrus/blob/master/screenshots/editor.png?raw=true)

### 菜单条

从左往右依次为：
+ 打开本地JSON文件
+ 保存为本地JSON文件
+ 快速加载（LocalStorage）
+ 快速保存（LocalStorage）
+ 放大
+ 缩小
+ 重置
+ Undo
+ Redo
+ 清空
+ 添加节点/标签

### 交互操作

+ Root节点不可操作，只能有一个子节点
+ 可自由拖动节点
+ 可自由在节点间拖放标签
+ 可通过Ctrl+C/Ctrl+V拷贝粘贴节点/标签
+ 双击节点/标签弹出编辑对话框

#### 添加节点

可添加4类节点：
+ Selector 选择节点
+ Sequence 序列节点
+ Parallel 并行节点
+ Task 任务节点

注意： 向Root 节点添加节点时，如果Root节点

![image](https://github.com/guobinnew/Hydrus/blob/master/screenshots/add-selector.png?raw=true)


#### 添加标签

2类标签
+ Decorator 条件标签
+ Service 服务标签

![image](https://github.com/guobinnew/Hydrus/blob/master/screenshots/add-decorator.png?raw=true)


### 调试器

调试模式下，行为树只能编辑与运行相关的属性

![image](https://github.com/guobinnew/Hydrus/blob/master/screenshots/debug.png?raw=true)

### 菜单条

从左往右依次为：
+ 重新加载
+ 放大
+ 缩小
+ 重置

### 交互操作

+ 双击节点/标签弹出编辑对话框

### 加载JS代码

主界面右边属性栏分别为：JS代码、运行控制和Blackboard面板

#### 代码绑定设计

行为树中Task节点，Decorator标签和Service标签具有Script属性，用于JS代码绑定（对应JS函数名）
可通过Paramters属性为JS函数指定输入参数

#### 加载JS

打开JS编辑器，编辑JS代码，保存

![image](https://github.com/guobinnew/Hydrus/blob/master/screenshots/edit-script.png?raw=true)

JS代码格式示例如下

```
const d = {
  data: {
      a: 1,
      b: true,
      c: 'abc',
      d: () => {},
      e: {
        f: 1,
        g: []
      },
      h: [0, 15, 3],
      i: [
        { a: 1 },
        { a: 2 },
        { a: 3 }
      ],
      j: 23.45,
      k: null,
      l: undefined,
      m: '' + 12
  },
  decorators: {
    isHot (delta, upbound = 30) {
      return this.$data.temperature >= upbound
    },
  },
  services: {
    clampTemperature (delta, min, max) {
      if (this.$data.temperature > max) {
        this.$data.temperature = max
      } else if (this.$data.temperature < min) {
        this.$data.temperature = min
      }
    },
  },
  tasks: {
    heating (delta) {
      this.$data.temperature += 5
      console.log('heating--', this.$data.temperature)
    }
  }
}
```

### 运行控制

![image](https://github.com/guobinnew/Hydrus/blob/master/screenshots/control.png?raw=true)

每次运行开始前会进行行为树检查，检查行为树中节点的Script属性是否与JS代码相匹配，并给出警告信息；只有通过检查才能运行


### Balckboard

显示当前运行状态下的Blackboard变量值，可编辑修改变量值

![image](https://github.com/guobinnew/Hydrus/blob/master/screenshots/blackboard.png?raw=true)
