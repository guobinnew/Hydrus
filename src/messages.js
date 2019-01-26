
const _messages = {
  common: {
    appTitle: {zh: '行为树编辑器', en: 'Hydrus'},
    copyright: {zh: '©2018 Unqiue 版权所有', en: '©️2018 Unique All rights reserved.'}
  },
}

const messages = {
  zh: {},
  en: {}
}
for (let [key, value] of Object.entries(_messages)) {
  for (let [name, defs] of  Object.entries(value)) {
    for (let [lang, text] of  Object.entries(defs)) {
      let obj = messages[lang]
      if (!obj) {
        obj = {}
        messages[lang] = obj
      }
      let prop = obj[key]
      if (!prop) {
        prop = {}
        obj[key] = prop
      }
      prop[name] = text
    }
  }
}

export default  messages