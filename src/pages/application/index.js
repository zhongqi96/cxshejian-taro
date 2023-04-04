import React, { Component } from "react";
import { View,Button,Image } from "@tarojs/components";
import Taro,{ request,getStorageSync,setStorageSync } from '@tarojs/taro'
import config from '../../utils/config'
import "./index.scss";
import API from '@/api'
import postInfo from '@/static/img/zowoyoo/postinfo.jpg'
export default class Application extends Component {
  state = {
    qrcode: 'http://qnimg.zowoyoo.com/img/null/1581318658992.png',
    custServiceName: 'daiwozoukefu',
    text: '点击链接长按识别客服二维码',
    fromPage: 'with'
  }
  onLoad (options) {
    console.log(options)
    if(options.fromPage === 'with') {
      Taro.setStorageSync('account','application')
    }
    if (options && options.qrcode && options.wxid) {
      this.setState({
        qrcode: options.qrcode,
        custServiceName: options.wxid,
        fromPage: options.fromPage
      }, () => {
        const token = options['X-Authorization']
        // API.Zowoyoo.savaLink({
        //   content: this.state.text,
        //   minappOpenid: getApp().globalData.openId,
        //   url: this.state.qrcode
        // }).then(res=>{
        //   console.log(res)
        // })
        let openId = Taro.getStorageSync('openId')
        Taro.request({
          url: `${config.target}/mtourists-core/wechat/message/outer-link/save`,
          method: 'POST',
          data: {
            content: this.state.text,
            minappOpenid: openId,
            url: this.state.qrcode
          },
          header: {
            'X-Authorization': `Bearer ${token}`,
            siteId: 6
          },
          success: res => {
            console.log(res)
          },
          fail: err => {
            console.log(err)
          }
        })
      })
    }

  }
  cancel= () => {
    if (this.state.fromPage === 'detail') {
      Taro.navigateBack()
    } else {
      Taro.switchTab({
        url: '/pages/mall/index',
      })
    }
  }
  copyContent = () => {
    Taro.setClipboardData({
      data: this.state.custServiceName,
      success(res) {
        console.log(res)
      }
    })
  }
  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

  componentDidCatchError() {}

  render() { 
    return (
      <View class="application">
        <View class="application-top">
          <Image
            class="application-back"
            mode="widthFix"
            src="http://qnimg.zowoyoo.com/img/null/1581317122695.png"
          ></Image>
          <View class="top-text">
            <Image
              class="application-success"
              src="http://qnimg.zowoyoo.com/img/null/1584933545877.png"
              mode="widthFix"
            ></Image>
            <text>提现申请已提交，正在审核中</text>
          </View>
          <View class="cust-text">
            <text>请添加客服微信好友，核对信息，查看进度</text>
          </View>
        </View>
        <View class="application-qrcode">
          <View class="qrcode-box">
            <Image class="qrcode" mode="widthFix" src={this.state.qrcode}></Image>
          </View>
          <View class="cust-box">
            <text>发送二维码，或者微信搜索</text>
            <text class="cust-name">{ this.state.custServiceName }</text>
            <text class="cust-copy" onClick={this.copyContent}>
              复制
            </text>
          </View>
        </View>
        <View class="third-party-btn">
          <Button class="customer-cancel" onClick={this.cancel}>
            <View>返回</View>
          </Button>
          <Button
            class="customer-sure"
            open-type="contact"
            onContact="handleContact"
            show-message-card="true"
            send-message-img={postInfo}
            send-message-path="/pages/mall/index"
            send-message-title="客服信息"
          >
            <View>发送二维码</View>
          </Button>
        </View>
      </View>
    );
  }
}
