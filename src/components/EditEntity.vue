 <template>
    <div class="container" id="entity">
            <el-form :model="model.form" label-width="120px" size="small" status-icon
                     :rules="rules" ref="form">
                <el-form-item label="Parent">
                    <el-tag type="success">{{ model.form.parent }}</el-tag>
                </el-form-item>
                 <el-form-item label="Type" prop="type">
                    <el-radio-group v-model="model.form.type" :disabled="model.action !== 'add' ">
                        <el-radio-button v-for="(val, key) in nodeTypes" :label="key" name="type">{{val}}</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="Title" prop="title" >
                    <el-input v-model="model.form.title" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="Subtitiles">
                    <el-tag
                            :key="tag"
                            v-for="(tag, i) in model.form.subtitles"
                            :closable=" i > 0 "
                            :disable-transitions="false"
                            @close="handleTagClose(tag)">
                        {{tag}}
                    </el-tag>
                    <el-input
                            class="input-new-tag"
                            v-if="inputVisible"
                            v-model="inputValue"
                            ref="saveTagInput"
                            size="small"
                            @keyup.enter.native="handleTagInputConfirm"
                            @blur="handleTagInputConfirm"
                    >
                    </el-input>
                    <el-button v-else class="button-new-tag" size="small" @click="showTagInput">
                        +
                    </el-button>
                </el-form-item>
            </el-form>
    </div>        
 </template>
<style scoped>
    .container {
        text-align: left;

    }
    .el-tag + .el-tag {
        margin-left: 10px;
    }

    .button-new-tag {
        margin-left: 10px;
        height: 32px;
        line-height: 30px;
        padding-top: 0;
        padding-bottom: 0;
    }

    .input-new-tag {
        width: 90px;
        margin-left: 10px;
        vertical-align: bottom;
    }

</style>

<script>
  export default {
    props: ["model"],
    data: function () {

       const validateSelect = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('不能为空'))
        } else {
          callback()
        }
      }

      return {
        nodeTypes: {
            selector: 'selector',
            sequence: 'sequence',
            parallel: 'parallel',
            task: 'task'
        },
        inputVisible: false,
        inputValue: '',
        rules:{
            title: [{ required: true, message: '不能为空', trigger: 'blur' }],
            type: [{ required: true, validator: validateSelect, trigger: 'change' }]
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
        });
      },
      handleTagInputConfirm() {
        let inputValue = this.inputValue
        if (inputValue) {
          this.model.form.subtitles.push(inputValue)
        }
        this.inputVisible = false
        this.inputValue = ''
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
