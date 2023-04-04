import React, { Component } from 'react'
import { connect } from 'react-redux'
import { WebView } from '@tarojs/components'
import config from '../../utils/config'
import Taro from '@tarojs/taro'
import shareImg from '@/static/img/zowoyoo/share.jpg'

import './index.scss'
type PageStateProps = {

}

type PageDispatchProps = {

}

type PageOwnProps = {}

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface User {
  props: IProps;
}

@connect(() => ({

}), () => ({

}))
class User extends Component {
  state = {
    webViewUrl: '',
    shareParam: {},
    webviewParam: {},
    params: 'siteId=6',
    isHome: true
  }
  componentWillUnmount () { }

  // componentDidShow () {
  //   let account = Taro.getStorageSync('account')
  //   const webviewlink = config[config.environmental]
  //   let orderId = Taro.getStorageSync('orderId')
  //   let paystatus = Taro.getStorageSync('paystatus')
  //   let times = new Date().getTime()
  //   if(orderId) {
  //     if(paystatus) {
  //       setTimeout(()=>{
  //         this.setState({
  //           webViewUrl: `${webviewlink}paystatus?siteId=6&time=${times}&orderId=${orderId}&payfrom=pay`
  //         })
  //       },400)
  //     }else {
  //       setTimeout(()=>{
  //         this.setState({
  //           webViewUrl: `${webviewlink}orderallpay/${orderId}?isgo=pay`
  //         })
  //       },400)
  //     }
  //   }else if(account) {
  //     this.setState({
  //       webviewUrl: `${webviewlink}account?time=${times}&siteId=6&from=application`
  //     })
  //   } else {
  //     this.setState({
  //       webviewUrl: `${webviewlink}user?time=${times}siteId=6`
  //     })
  //   }
  //   Taro.removeStorageSync('account')
  //   Taro.removeStorageSync('orderId')
  //   Taro.removeStorageSync('paystatus')
  // }
  componentDidShow () {
    let infoId = Taro.getStorageSync('infoId')
    let orderId = Taro.getStorageSync('orderId')
    let paystatus = Taro.getStorageSync('paystatus')
    let account = Taro.getStorageSync('account')
    const Timestamp = new Date().getTime()
    const webviewlink = config[config.environmental]
    if(infoId) {
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
    }
     else {
      this.setState({
        webViewUrl: `${webviewlink}user?siteId=6&time=${Timestamp}`
      })
    }
    Taro.removeStorageSync('infoId')
    Taro.removeStorageSync('orderId')
    Taro.removeStorageSync('paystatus')
    Taro.removeStorageSync('account')
  }

  componentDidHide () {
    this.setState({
      webViewUrl: ''
    })
  }
  onMessage= (e)=> {
    if (e.detail.data) {
      this.state.shareParam = e.detail.data[e.detail.data.length - 1]
    }
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
  bindload(e) {
    console.log(e)
  }
  binderror(e) {
    console.log(e)
  }
  render () {
    return (
      <WebView onMessage={this.onMessage} src={this.state.webViewUrl} onError={this.binderror} onLoad={this.bindload} />
    )
  }
}

export default User

