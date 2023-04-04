const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 格式化请求参数
const formatParam = params=> {
  let parameter = ''
  for (var key in params) {
    parameter += `${key}=${params[key]}&`
  }
  parameter = parameter.substr(0, parameter.length - 1)
  return parameter
}

function js_date_time(unixtime) {
  var dateTime = new Date(parseInt(unixtime))
  var year = dateTime.getFullYear();
  var month = dateTime.getMonth() + 1;
  var day = dateTime.getDate();
  var hour = dateTime.getHours() < 10 ? `0${dateTime.getHours()}` : dateTime.getHours();
  var minute = dateTime.getMinutes() < 10 ? `0${dateTime.getMinutes()}` : dateTime.getMinutes();
  var second = dateTime.getSeconds() < 10 ? `0${dateTime.getSeconds()}` : dateTime.getSeconds();
  var now = new Date();
  // var timeSpanStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
  var timeSpanStr = `${month}月${day}日 ${hour}:${minute}`
  return timeSpanStr;
}

module.exports = {
  formatTime: formatTime,
  formatParam: formatParam,
  js_date_time: js_date_time
}
