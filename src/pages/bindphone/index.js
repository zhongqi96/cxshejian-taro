import React, { Component } from "react";
import { View, Button, Image,Text } from "@tarojs/components";
import API from '@/api'
import Taro,{request, showToast ,getStorageSync} from '@tarojs/taro'
import config from '../../utils/config'
import "./index.scss";
import winxinpng from '@/static/img/zowoyoo/weixin.png'
export default class Bindphone extends Component {
  state = {
    encryptedData: '',
    iv: '',
    wxPhoneNumber: '', // 微信的手机号
    originalPhoneNumber: '', // 原本的手机号从h5带来
    originalImg: '',
    originalName: '',
    zoowoyooToken: '', // token
    bc:''
  }
  onLoad (options) {
    if(options) {
      this.setState({
        originalPhoneNumber: options.valuePhone,
        originalImg: decodeURIComponent(options.valueImg),
        originalName: options.valueName,
        zoowoyooToken: options.zooyooToken,
        bc: options.bc
      })
    }
  }
  getPhoneNumber = (e) => {
    if(e && e.detail && e.detail.errMsg==="getPhoneNumber:ok") {
      this.state.encryptedData = e.detail.encryptedData
      this.state.iv = e.detail.iv
    }
    this.decryptPhoneNumber().then(res=>{
      if(res && res.data && res.data.state === 1) {
        this.state.wxPhoneNumber = res.data.data.phoneNumber
        Taro.showToast({
          title: '加载中',
          icon: 'loading',
          mask:true
        })
        Taro.request({
          url: `${config.target}/mtourists-core/user/mobile?mobile=${this.state.wxPhoneNumber}`,
          method: 'PUT',
          header: {
            'X-Authorization': `Bearer ${this.state.zoowoyooToken}`,
            siteId: 6
          },
          success: res => {
            Taro.showToast({
              title: '修改成功',
              icon: 'success',
              mask: true,
              duration: 2000,
              success: res=>{
                setTimeout(()=>{
                  wx.reLaunch({
                    url: `/pages/mall/index?environmental=t&page=user&from=miniapp&valuePhone=${this.state.originalPhoneNumber}&valueName=${this.state.originalName}&valueImg=${this.state.originalImg}`,
                  })
                },2000)
              }
            })
          },
          fail: err => {
            
          }
        })
        
        // API.Zowoyoo.changeMobile({mobile: this.state.wxPhoneNumber}).then(res=>{
        //   Taro.showToast({
        //     title: '修改成功',
        //     icon: 'success',
        //     mask:true,
        //     duration: 2000,
        //     success: res =>{
        //       setTimeout(()=>{
        //         Taro.switchTab({
        //           url: `/pages/user/index?environmental=t&page=user&from=miniapp&valuePhone=${this.state.originalPhoneNumber}&valueName=${this.state.originalName}&valueImg=${this.state.originalImg}`,
        //         })
        //       },2000)
        //     }
        //   })
        // })
      }
    })

  }
  otherPhone = () => {
    Taro.switchTab({
      url: `/pages/user/index?environmental=t&page=phone&from=miniapp&valuePhone=${this.state.originalPhoneNumber}&valueName=${this.state.originalName}&valueImg=${this.state.originalImg}`,
    })
  }
  decryptPhoneNumber = () => {
    return new Promise((resolve) => {
      Taro.request({
        url: `${config.target}/mtourists-core/user/minappUserPhone?encryptedData=${encodeURIComponent(this.state.encryptedData)}&iv=${encodeURIComponent(this.state.iv)}&openid=${Taro.getStorageSync('openId')}`,
        method: 'GET',
        header: {
          'X-Authorization': `Bearer ${this.state.zoowoyooToken}`,
          siteId: 6
        },
        success: res => {
          resolve(res)
        },
        fail: err => {
          resolve(err)
        }
      })
    })
  }
  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

  componentDidCatchError() {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <View class="bind-phone">
        <View class="get-phone">
          <Button
            open-type="getPhoneNumber"
            plain="true"
            onGetphonenumber={this.getPhoneNumber}
          >
            <View class="phone-box">
              <Image class="wxchat" src={winxinpng}></Image>
              <Text>从微信获取手机号</Text>
            </View>
          </Button>
        </View>
        <View class="tips">
          <Text>方便快捷，无需验证</Text>
        </View>
        <View class="other-phone" onClick={this.otherPhone}>
          <Button plain="true">
            <View class="other-box">
              <Text>使用其他手机号码</Text>
            </View>
          </Button>
        </View>
      </View>
    );
  }
}
