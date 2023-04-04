import React, { Component } from "react";
import { View } from "@tarojs/components";
import Taro, { getCurrentPages,showToast,getStorageSync,setStorageSync,requestPayment,request } from '@tarojs/taro'
import "./index.scss";
import API from '@/api'
import config from '../../utils/config'
export default class Payment extends Component {
  onLoad (options) {
    const token = options['X-Authorization']
    const interiorAppId = `wx18f8259aecab011a`
    console.log(options,'-----------------+++++++++++++')
    const orderId = options['oderId']
    console.log(orderId,'===================')
    Taro.request({
      url: `${config.target}/mtourists-core/order/minapp/AllinPayInfo/${orderId}?appId=${interiorAppId}&openid=${Taro.getStorageSync('openId')}`,
      method: 'POST',
      header: {
        'X-Authorization': `Bearer ${token}`,
        'siteId': 6
      },
      success: res => {
        console.log('wo request'+JSON.stringify(res))
        if (res.data && res.data.state === 1) {
          const paymentParams = res.data.data
          console.log(paymentParams)
          this.requestPayment(paymentParams)
        } else {
          Taro.showToast({
            title: '调起收银台失败',
            icon: 'none',
            duration: 2000
          })
          // let webviewUrl = config[config.environmental]
          // var pages = getCurrentPages();
          // var currPage = pages[pages.length - 1];
          // var prevPage = pages[pages.length - 2];
          // prevPage.setState({
          //   webViewUrl: `${webviewUrl}orderallpay/${options.oderId}?isgo=pay`,
          // })
          Taro.setStorageSync('orderId',options.oderId)
          Taro.setStorageSync('paystatus',false)
          Taro.navigateBack()
        }
      },
      fail: err => {
        Taro.showToast({
          title: '调起收银台失败',
          icon: 'none',
          duration: 2000
        })
        // let webviewUrl = config[config.environmental]
        // var pages = getCurrentPages();
        // var currPage = pages[pages.length - 1];
        // var prevPage = pages[pages.length - 2];
        // prevPage.setState({
        //   webViewUrl: `${webviewUrl}orderallpay/${options.oderId}?isgo=pay`,
        // })
        Taro.setStorageSync('orderId',options.oderId)
        Taro.setStorageSync('paystatus',false)
        Taro.navigateBack()
      }
    })
    //页面加载调取微信支付（原则上应该对options的携带的参数进行校验）
    // this.requestPayment(options);
  }
  //根据 obj 的参数请求wx 支付
  requestPayment (obj) {
    //获取options的订单Id
    var orderId = obj.orderId
    //调起微信支付
    Taro.requestPayment({
      //相关支付参数
      'timeStamp': obj.timestamp,
      'nonceStr': obj.noncestr,
      'package': obj.packages,
      'signType': obj.signtype,
      'paySign': obj.paysign,
      //小程序微信支付成功的回调通知
      success: (res)=> {
        //定义小程序页面集合
        // var pages = getCurrentPages();
        //当前页面 (wxpay page)
        // var currPage = pages[pages.length - 1];
        //上一个页面 （index page）
        // var prevPage = pages[pages.length - 2];
        //通过page.setState方法使index的webview 重新加载url  有点类似于后台刷新页面
        //此处有点类似小程序通过加载URL的方式回调通知后端 该订单支付成功。后端逻辑不做赘述。
        // let webviewUrl = config[config.environmental]
        // prevPage.setState({
        //   webViewUrl: `${webviewUrl}paystatus?orderId=${orderId}&payfrom=pay`,
        // })
        //小程序主动返回到上一个页面。即从wxpay page到index page。此时index page的webview已经重新加载了url 了
        //微信小程序的page 也有栈的概念navigateBack 相当于页面出栈的操作
        Taro.setStorageSync('orderId',orderId)
        Taro.setStorageSync('paystatus',true)
        Taro.navigateBack()
      },
      //小程序支付失败的回调通知
      fail: (res)=> {
        Taro.showToast({
          title: '支付失败',
          icon: 'none',
          duration: 2000
        })

        Taro.setStorageSync('orderId',orderId)
        Taro.setStorageSync('paystatus',false)
        Taro.navigateBack()
      }
    })
  }
  // 支付失败
  payFail() {
    let webviewUrl = config[config.environmental]
    console.log("支付失败"),
      console.log(res)
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];
    var prevPage = pages[pages.length - 2];
    console.log("准备修改数据")
    prevPage.setState({
      webViewUrl: `${webviewUrl}orderallpay/${orderId}?isgo=pay`,
    })
    console.log("准备结束页面")
    Taro.navigateBack()
  }
  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

  componentDidCatchError() {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <View class="page-body">
        <View class="page-section page-section-gap"></View>
      </View>
    );
  }
}
