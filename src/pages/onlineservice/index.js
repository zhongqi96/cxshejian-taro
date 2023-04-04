import React, { Component } from "react";
import { View,Button,Image,Text } from "@tarojs/components";
import Taro,{request,getStorageSync} from '@tarojs/taro'
import config from '../../utils/config'
import "./index.scss";
import API from '@/api'
import firstStep from '@/static/img/zowoyoo/first-step.png'
import secondStep from '@/static/img/zowoyoo/second-step.png'
import postInfo from '@/static/img/zowoyoo/postinfo.jpg'

export default class Onlineservice extends Component {
  state = {
    titleType: '0', // 0为默认空title ； 1:设置提醒 ；2：团长升级后 ；3：在线客服（未关注）；4: 在线客服（已关注）；5：支付完成
    showAccount: true,
    noAccount:'',
    siteId: '6',
    isAttent: false // 是否关注公众号，false没有。true已关注
  }
  onLoad (options) {
    console.log(options)
    if (options && options.titleType) {
      const token = options['X-Authorization']
      this.setState({
        titleType: options.titleType,
        siteId: '6'
      })
      // API.Zowoyoo.attentionCode({
      //   sceneId: 334
      // }).then(res=>{
      //   if (res.data.state === 1) {
      //     // 未关注公众号
      //     this.setState({
      //       isAttent: false
      //     })
      //   } else {
      //     // 已关注公众号
      //     this.setState({
      //       isAttent: true
      //     })
      //   }
      // }).catch(()=>{
      //   this.setState({
      //     isAttent: false
      //   })
      // })
      Taro.request({
        url: `${config.target}/mtourists-api/pddapi/user/attentionCode?sceneId=334`,
        method: 'GET',
        header: {
          'X-Authorization': `Bearer ${token}`,
          siteId: 6
        },
        success: res => {
          if (res.data.state === 1) {
            // 未关注公众号
            this.setState({
              isAttent: false
            })
          } else {
            // 已关注公众号
            this.setState({
              isAttent: true
            })
          }
        },
        fail: err => {
          this.setState({
            isAttent: false
          })
        }
      })
      // API.Zowoyoo.savaLink({
      //   content: '想体验更多功能，请长按识别二维码关注“畅行舌尖”公众号',
      //     minappOpenid: getApp().globalData.openId,
      //     url: 'url',
      //     isFollow: 1,
      //     siteId: this.state.siteId
      // }).then(res=>{
      //   console.log(res)
      // })
      Taro.request({
        url: `${config.target}/mtourists-core/wechat/message/outer-link/save`,
        method: 'POST',
        data: {
          content: '想体验更多功能，请长按识别二维码关注“畅行舌尖”公众号',
          minappOpenid: Taro.getStorageSync('openId'),
          url: 'url',
          isFollow: 1,
          siteId: 6
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
    }
  }
  accountLoad() {
    this.setState({
      showAccount: true,
      noAccount:'nohas-account'
    })
  }
  accounterror() {
    this.setState({
      showAccount: false,
      noAccount: 'has-account'
    })
  }
  handleContact(e) {
    console.log(e.detail.path)
    console.log(e.detail.query)
  }
  cancel() {
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
      <View class="onlineservice-body">
        <View class="account">
          <official-account
            onLoad="accountLoad"
            onError="accounterror"
          ></official-account>
        </View>
        <View class="new-onlineservice">
          <View class="first-step">
            <View>
              <Image
                class="f-step-img"
                src={firstStep}
                mode="widthFix"
              ></Image>
            </View>
            <View class="f-Text">
              <View class="step-title">
                <Text>第</Text>
                <Text class="title-num">1</Text>
                <Text>步</Text>
              </View>
              <View>点击页面底部“确认”按钮 获取详细信息</View>
            </View>
          </View>
          <View class="second-step">
            <View class="s-Text">
              <View class="step-title">
                <Text>第</Text>
                <Text class="title-num">2</Text>
                <Text>步</Text>
              </View>
              <View>点击右下角“点我开始” 为您推送您需要的链接</View>
            </View>
            <View>
              <Image
                class="s-step-img"
                src={secondStep}
                mode="widthFix"
              ></Image>
            </View>
          </View>
        </View>
        <View class="customer-btn">
          <Button class="customer-cancel" onClick={this.cancel}>
            <View>暂时不想看了</View>
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
            <View>确认</View>
          </Button>
        </View>
      </View>
    );
  }
}
