import Taro, { request, showLoading, hideLoading, showToast, getCurrentInstance } from '@tarojs/taro'
import HTTP from '@/api'

class API {
  getToken = false
  // 四种请求方式
  get(args) {
    return this.http(args, 'GET')
  }
  post(args) {
    return this.http(args, 'POST')
  }
  put(args) {
    return this.http(args, 'PUT')
  }
  delete(args) {
    return this.http(args, 'DELETE')
  }
  

  // api控制器
  http(args, method = 'GET') {
    let { url, data, loading=false, toast=true } = args
    // loading
    loading && showLoading({ title: '加载中...', mask: true })
    // 判断请求类型
    let contentType
    // GET请求
    if (method === 'GET') {
      contentType = 'application/json'
      // POST 请求
    } else if (method === 'POST') {
      
      (url.includes('/api') || url.includes('/chezhantong'))
        ? contentType = 'application/json'
        : contentType = 'application/x-www-form-urlencoded'
    }
    url = this.resetUrl(url)
    // 用户token
    let Authorization: string = Taro.getStorageSync('token')
    let _this = this
    return new Promise((resolve, reject) => {
      request({
        url,
        data,
        method,
        header: {
          'content-type': contentType,
          Authorization,
          'X-Authorization': 'Bearer 06764f6f3f9098c31979ab6e6a837267',
          // Authorization,
          // 'token':'0e58bb826e64460c85e25cba438f20f3'
        },
        // 请求成功回调
        success(res) {
          resolve(_this.beforeResponse(res.data, toast))
        },
        // 失败回调
        fail(res) {
          toast && showToast({title: '接口请求失败', icon: 'none'})
          reject(res.data)
        },
        // 成功失败都回调
        complete: () => {
          // 请求次数递减
          // this.reqNum--
          // if (_this.reqNum === 0) {
          //   loading && hideLoading()
          // }
          loading && hideLoading()
        },
      })
    })
  }
  // 修改请求地址
  resetUrl(url) {
    let defaultUrl = ''
    // 所有接口域名地址配置
    let urlOptions = [
      {
        code: '/api', // 公司内部接口
        apiUrl: process.env.API_URL
      },
      {
        code: '/wtkj', // 武汉威泰行程接口
        apiUrl: process.env.API_VEGA_STATION
      },
      {
        code: '/weitaikeji', // 武汉威泰行程接口
        apiUrl: process.env.API_WEITAIKEJI
      },
      {
        code: '/chezhantong', // 武汉威泰行程接口
        apiUrl: process.env.API_WEITAIKEJI
      },
      {
        code: '/ziwoyou', // 自我游接口
        apiUrl: process.env.API_ZIWOYOU
      }
    ]
    urlOptions.forEach(item => {
      url.includes(item.code) && (defaultUrl = item.apiUrl + url.replace(item.code, ''))
    })
    return defaultUrl
  }

  // 响应拦截
  beforeResponse(res, toast) {
    if (+res.code === 200 || +res.code === 201) {
      // if (!Taro.getStorageSync('token')) {
      //   Taro.login({
      //     success: val => {
      //       let code = val.code
      //       HTTP.Global.login({code})
      //         .then(() => {
      //           Taro.setStorageSync('token', res.data)
      //           _this.getToken = false
      //           HTTP.Global.getUserInfo()
      //             .then(info => {
      //               info.data && Taro.setStorageSync('openId', info.data.openId)
      //               // let page: any = getCurrentInstance().page
      //               // page.onShow()
      //             })
      //         })
      //     }
      //   })
      // }
    } else if (+res.status === 400) {
      toast && showToast({title: '接口请求失败', icon: 'none'})
    } else if (+res.code !== 1 && +res.state !== 1) {
      toast && res.message && showToast({title: res.message, icon: 'none'})
    }

    return res
  }
}

export default new API()
