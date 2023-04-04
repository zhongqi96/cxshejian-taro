import React, { Component } from 'react'
import { connect } from 'react-redux'
import { WebView } from '@tarojs/components'
import config from '../../utils/config'
import util from '../../utils/zowoyooutil'
import Taro from '@tarojs/taro'
import pages from '../../utils/pages'
import shareImg from '@/static/img/zowoyoo/share.jpg'
import './index.scss'

type PageStateProps = {

}

type PageDispatchProps = {

}

type PageOwnProps = {}

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Mall {
  props: IProps;
}

@connect(() => ({

}), () => ({

}))
class Mall extends Component {
  state = {
    webViewUrl: '',
    shareParam: {},
    webviewParam: {},
    params: 'siteId=6',
    isHome: true
  }
  componentDidShow () {
    let infoId = Taro.getStorageSync('infoId')
    let orderId = Taro.getStorageSync('orderId')
    let paystatus = Taro.getStorageSync('paystatus')
    let account = Taro.getStorageSync('account')
    let preference = Taro.getStorageSync('preference')
    let hotRecommend = Taro.getStorageSync('hotRecommend')
    let today = Taro.getStorageSync('today')
    let productdynamic = Taro.getStorageSync('productdynamic')
    const Timestamp = new Date().getTime()
    const webviewlink = config[config.environmental]
    if (today) {
      setTimeout(()=>{
        this.setState({
          webViewUrl: `${webviewlink}today?to=today&time=${Timestamp}`
        })
      },400)
    }  else if (productdynamic) {
      setTimeout(()=>{
        this.setState({
          webViewUrl: `${webviewlink}productdynamic/${productdynamic}?time=${Timestamp}`
        })
      },400)
    }  else if (hotRecommend) {
      setTimeout(()=>{
        this.setState({
          webViewUrl: `${webviewlink}classify/0?time=${Timestamp}`
        })
      },400)
    } else if (preference) {
      setTimeout(()=>{
        this.setState({
          webViewUrl: `${webviewlink}classify/101098?time=${Timestamp}`
        })
      },400)
    } else if(infoId) {
      this.setState({
        params: `siteId=6&environmental=t&page=product&infoId${infoId}`
      },()=>{
        setTimeout(()=>{
          this.setState({
            webViewUrl: `${webviewlink}product/${infoId}?siteId=6&time=${Timestamp}`
          })
        },400)
      })
      // 隐藏tabBar
      // Taro.hideTabBar()
    } else if(orderId) {
      if(paystatus) {
        setTimeout(()=>{
          this.setState({
            webViewUrl: `${webviewlink}paystatus?siteId=6&time=${Timestamp}&orderId=${orderId}&payfrom=pay`
          })
        },400)
      }else {
        setTimeout(()=>{
          console.log(`${webviewlink}orderallpay/${orderId}?isgo=pay&siteId=6`,'---------------------')
          this.setState({
            webViewUrl: `${webviewlink}orderallpay/${orderId}?isgo=pay&siteId=6`
          })
        },400)
      }
    } else if(account) {
      setTimeout(()=>{
        this.setState({
          webViewUrl: `${webviewlink}account?siteId=6&time=${Timestamp}&from=application`
        })
      },400)
    } else {
      this.setState({
        webViewUrl: `${webviewlink}home?siteId=6&time=${Timestamp}`
      })
    }
    Taro.removeStorageSync('infoId')
    Taro.removeStorageSync('orderId')
    Taro.removeStorageSync('paystatus')
    Taro.removeStorageSync('account')
    Taro.removeStorageSync('preference')
    Taro.removeStorageSync('hotRecommend')
    Taro.removeStorageSync('today')
    Taro.removeStorageSync('productdynamic')
  }
  UNSAFE_componentWillMount () {
    Taro.showShareMenu({
      withShareTicket: true
    })
  }
  UNSAFE_componentWillUnmount () { }

  componentDidHide () {
    this.setState({
      webViewUrl: ''
    })
  }
  onLoad (query) {
    setTimeout(()=>{
      const Timestamp = new Date().getTime()
    if (query && query.scene) {
      // 扫描商品详情二维码进入的情况或者扫码直播间海报
      const scene = decodeURIComponent(query.scene)
      let paramsArr = scene.split('/')
      if (paramsArr[0] === 'R') {
        // 直播间海报
        let siteId = ''
        if(paramsArr.length === 7) {
          siteId = paramsArr[paramsArr.length - 3]
        }
        console.log(paramsArr)
        console.log(siteId)
        const roomId = paramsArr[1]
        // const customParams = `${paramsArr[2]}/${paramsArr[3]}A${siteId}`
        // 在这里进行埋点
        // 埋点结束
        // Taro.redirectTo({
        //   url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${encodeURIComponent(customParams)}`
        // })
      } else if(paramsArr[0] === 'D') {
        this.state.webviewParam['environmental'] = paramsArr[paramsArr.length - 2]
        this.state.webviewParam['custId'] = paramsArr[2]
        this.state.webviewParam['shareId'] = paramsArr[3]
        this.state.webviewParam['page'] = `productdynamic/${paramsArr[1]}`
        this.state.webviewParam['siteId'] = 6
      } else if(paramsArr[0] === 'H') {

        this.state.webviewParam['environmental'] = paramsArr[paramsArr.length - 2]
        this.state.webviewParam['custId'] = paramsArr[2]
        this.state.webviewParam['shareId'] = paramsArr[3]
        this.state.webviewParam['page'] = `home`
        this.state.webviewParam['siteId'] = 6
      }
       else {
        if (paramsArr[paramsArr.length - 1] === 'p') {
          // 商品详情页
          this.state.webviewParam['page'] = pages[paramsArr[paramsArr.length - 1]]
          this.state.webviewParam['environmental'] = paramsArr[paramsArr.length - 2]
          this.state.webviewParam['infoId'] = paramsArr[0]
          this.state.webviewParam['custId'] = paramsArr[1]
          this.state.webviewParam['shareId'] = paramsArr[2]
          if (paramsArr[4] === 'U') {
            this.state.webviewParam['union'] = paramsArr[4]
            this.state.webviewParam['page'] = pages['u']
          }
          if (paramsArr[3] !== 't') {
            this.state.webviewParam['siteId'] = 6
          }
          setTimeout(()=>{
            console.log(this.state.webviewParam,'++++++++++')
          },1000)
        }
      }
    }
    // 处理跳转逻辑
    if (query.infoId || query.activityId || query.page || query.siteId || query.room_id) {
      this.state.webviewParam = JSON.parse(JSON.stringify(query))
    }

    // 上面一直是处理app.globalData.webviewParam的方法
    let currentUrl = ''

    if (this.state.webviewParam && this.state.webviewParam.infoId) {
      let infoId = this.state.webviewParam.infoId
      let baseUrl = config[this.state.webviewParam.environmental]
      let urlParams = util.formatParam(this.state.webviewParam)
      let routePage = this.state.webviewParam.page
      let currentUrl = `${baseUrl}${routePage}/${infoId}?v=${Timestamp}&siteId=6&${urlParams}`
      this.state.isHome = false
      this.setState({
        webViewUrl: currentUrl
      }, () => {
        console.log(this.state.webViewUrl)
      })
    } else if (this.state.webviewParam && this.state.webviewParam.activityId) {
      const activityId = this.state.webviewParam.activityId
      let baseUrl = config[this.state.webviewParam.environmental]
      let urlParams = util.formatParam(this.state.webviewParam)
      let routePage = this.state.webviewParam.page
      let currentUrl = `${baseUrl}${routePage}/${activityId}?v=${Timestamp}&siteId=6&${urlParams}`
      this.state.isHome = false
      this.setState({
        webViewUrl: currentUrl
      }, () => {
        console.log(this.state.webViewUrl)
      })
    } else if (this.state.webviewParam && this.state.webviewParam.page === 'invite') {
      let baseUrl = config[this.state.webviewParam.environmental]
      let urlParams = util.formatParam(this.state.webviewParam)
      let routePage = this.state.webviewParam.page
      let currentUrl = `${baseUrl}${routePage}?v=${Timestamp}&siteId=6&${urlParams}`
      this.state.isHome = false
      this.setState({
        webViewUrl: currentUrl
      }, () => {
        console.log(this.state.webViewUrl)
      })
    } else if (this.state.webviewParam && this.state.webviewParam.page === 'talent') {
      let baseUrl = config[this.state.webviewParam.environmental]
      let urlParams = util.formatParam(this.state.webviewParam)
      let routePage = this.state.webviewParam.page
      let currentUrl = `${baseUrl}${routePage}?v=${Timestamp}&siteId=6&${urlParams}`
      this.state.isHome = false
      this.setState({
        webViewUrl: currentUrl
      }, () => {
        console.log(this.state.webViewUrl)
      })
    }
    else if (this.state.webviewParam && this.state.webviewParam.page === 'index') {
      const webviewlink = config[config.environmental]
      let urlParams = util.formatParam(this.state.webviewParam)
      this.state.isHome = false
      this.setState({
        webViewUrl: `${webviewlink}home?v=${Timestamp}&${urlParams}`
      })
      console.log(this.state.webViewUrl)
    } else if (this.state.webviewParam && this.state.webviewParam.page) {
      let baseUrl = config[this.state.webviewParam.environmental]
      let urlParams = util.formatParam(this.state.webviewParam)
      let routePage = this.state.webviewParam.page
      let currentUrl = `${baseUrl}${routePage}?v=${Timestamp}&siteId=6&${urlParams}`
      this.state.isHome = false
      this.setState({
        webViewUrl: currentUrl
      }, () => {
        console.log(this.state.webViewUrl)
      })
    }
    else {
      const webviewlink = config[config.environmental]
      console.log(webviewlink)
      let urlParams = util.formatParam(this.state.webviewParam)
      console.log(Timestamp)
      this.state.isHome = false
      this.setState({
        webViewUrl: `${webviewlink}home?v=${Timestamp}&siteId=6&${urlParams}`
      })
    }
    },200)
  }
  onMessage= (e)=> {
    if (e.detail.data) {
      this.state.shareParam = e.detail.data[e.detail.data.length - 1]
    }
  }
  bindload(e) {
    console.log(e)
  }
  binderror(e) {
    console.log(e)
  }
  onShareAppMessage(options) {
    if (options.webViewUrl.indexOf('product') > -1 || options.webViewUrl.indexOf('activity') > -1 || options.webViewUrl.indexOf('dynamic') > -1) {
      let currentPath = `/pages/mall/index?${this.state.shareParam.link}`
      if (!/\.(jpg|jpeg|png|JPG|PNG)$/.test(this.state.shareParam.imgSrc)) {
        return {
          title: this.state.shareParam.title,
          path: currentPath,
        }
      } else {
        return {
          title: this.state.shareParam.title,
          path: currentPath,
          imageUrl: this.state.shareParam.imgSrc
        }
      }
    } else if (options.webViewUrl.indexOf('share') > -1 || options.webViewUrl.indexOf('invite') > -1) {
      console.log(this.state.shareParam)
      let sharePath = `/pages/mall/index?${this.state.shareParam.link}`
      if (this.state.shareParam.imgSrc && /\.(jpg|jpeg|png|JPG|PNG)$/.test(this.state.shareParam.imgSrc)) {
        return {
          title: this.state.shareParam.title,
          path: sharePath,
          imageUrl: this.state.shareParam.imgSrc
        }
      }
      return {
        title: this.state.shareParam.title,
        path: sharePath,
        imageUrl: shareImg
      }
    } else {
      if (this.state.shareParam && this.state.shareParam.link) {
        return {
          title: '畅行舌尖，让你享受火车出行新生活',
          path: `/pages/mall/index?${this.state.shareParam.link}`,
          imageUrl: shareImg
        }
      } else {
        return {
          title: '畅行舌尖，让你享受火车出行新生活',
          path: `/pages/mall/index`,
          imageUrl: shareImg
        }
      }
    }
  }
  render () {
    return (
      <WebView onMessage={this.onMessage} src={this.state.webViewUrl} onError={this.binderror} onLoad={this.bindload} />
    )
  }
}

export default Mall

