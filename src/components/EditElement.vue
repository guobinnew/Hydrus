 <template>
    <div class="container" id="element">
            <Form :model="model.form" :label-width="120" :rules="rules" ref="form">
                <FormItem label="Parent">
                    <Tag color="success">{{ model.form.parent }}</Tag>
                </FormItem>
                 <FormItem label="Type" prop="type">
                    <RadioGroup v-model="model.form.type" @on-change="handleTypeChange">
                        <Radio v-for="(val, key) in nodeTypes" :label="key" :disabled="model.action !== 'add'">{{val}}</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="Title" prop="title" >
                    <Input v-model="model.form.title" placeholder="Enter title"></Input>
                </FormItem>
                <FormItem label="Script" prop="script">
                    <Input v-model="model.form.script" placeholder="Enter script function"></Input>
                </FormItem>
                <FormItem label="Subtitiles">
                    <Tag
                            :key="tag"
                            color="warning"
                            v-for="(tag, i) in model.form.subtitles"
                            :closable=" i > 0 "
                            @close="handleTagClose(tag)">
                        {{tag}}
                    </Tag>
                    <Input
                            class="input-new-tag"
                            v-if="inputVisible"
                            v-model="inputValue"
                            ref="saveTagInput"
                            size="small"
                            @keyup.enter.native="handleTagInputConfirm"
                            @on-blur="handleTagInputConfirm"
                    >
                    </Input>
                     <Button v-else  icon="ios-add" size="small" @click="showTagInput">
                    </Button>
                </FormItem>
                <FormItem label="Invert">
                     <i-switch v-model="model.form.invert" size="small" :disabled="model.form.type === 'service' ">
                        <span slot="open"></span>
                        <span slot="close"></span>
                    </i-switch>
                </FormItem>
            </Form>
    </div>        
 </template>
<style scoped>
    .container {
        text-align: left;

    }

    .el-tag + .el-tag {
        margin-left: 10px;
    }
   
    .el-tag {
        margin-top: 4px;
    }

    .input-new-tag {
        width: 90px;
        margin-left: 10px;
    }

</style>

<script>
  export default {
    props: ["model"],
    data: function () {
      return {
        nodeTypes: {
            decorator: 'Decorator',
            service: 'Service'
        },
        inputVisible: false,
        inputValue: '',
        rules:{
            script: [{ type: 'string', required: true, message: '格式不合法，只能包含大小写字母、数字和下划线', pattern: /^[a-zA-Z0-9_]+$/, trigger: 'blur' }],
            title: [{ type: 'string', required: true, message: '不能为空', trigger: 'blur' }],
            type: [{ required: true, message: '不能为空', trigger: 'change' }]
        }
      }
    },
    methods: {
      handleTagClose(tag) {
        this.model.form.subtitles.splice(this.model.form.subtitles.indexOf(tag), 1);
      },
      showTagInput() {
        this.inputVisible = true
        this.$nextTick(_ => {
          this.$refs['saveTagInput'].$refs.input.focus()
        })
      },
      handleTagInputConfirm() {
        let inputValue = this.inputValue
        if (inputValue) {
          this.model.form.subtitles.push(inputValue)
        }
        this.inputVisible = false
        this.inputValue = ''
      },
      handleTypeChange() {
        if (this.model.action === 'add') {
          this.model.title = 'Add ' + this.nodeTypes[this.model.form.type]
        } else {
          this.model.title = 'Edit ' + this.nodeTypes[this.model.form.type]
        }
        let subs = this.model.form.subtitles.slice(1)
        if (this.model.form.type === 'decorator') {
          subs.splice(0,0,'condition')
        } else {
          subs.splice(0,0,'service')
        }
        this.model.form.subtitles = subs
      },
      validate(cb) {
          this.$refs['form'].validate((valid) => {
             cb && cb(valid)
          })
      }
    },
    mounted: function () {
    }
  }

</script>
