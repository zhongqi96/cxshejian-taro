const fs = require('fs') // enlist-disable-line

// 读取pages目录内文件生成app.config.ts文件内容
let files = fs.readdirSync('./src/pages')
let index = files.findIndex(item => item === '.DS_Store')
index > -1 && files.splice(index, 1)
// 删除不需要的页面
let removeFiles = ['index', 'demo']
// 'application', 'bindphone', 'customer', 'guide', 'onlineservice', 'payment', 'poster'
files = files.filter(item => {
  return !removeFiles.includes(item)
})
// files.splice(files.findIndex(item => item === 'index'), 1)
files.unshift('index')
let fileArr = files.map(item => {
  return `'pages/${item}/index'`
})
let configContext = ''
fs.readFile('./src/app.config.ts', 'utf8', (err, data) => {
  configContext = data
  // 判断pages数组长度跟页面数量相同时不执行代码
  if (configContext.match(/index'/g) && (configContext.match(/index'/g).length === fileArr.length)) return
  let stringText = `pages: [
      ${fileArr}
  ],`
  
  stringText = stringText.replace(/index\'\,/g, '$&\n      ') // 空格符写缩进
  configContext = configContext.replace(/pages:[\s\S]+\]\,/g, stringText)
  fs.writeFile('./src/app.config.ts', configContext, 'utf8', function (error) {
    if (error) {
      console.log(error);
      return false;
    }
    console.log('------------生成app.config.ts成功------------');
  })
});
