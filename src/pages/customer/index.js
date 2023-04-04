import React, { Component } from "react";
import { View,Button,Text,Image } from "@tarojs/components";
import Taro,{request,getStorageSync} from '@tarojs/taro'
import "./index.scss";
import API from '@/api'
import firstStep from '@/static/img/zowoyoo/first-step.png'
import secondStep from '@/static/img/zowoyoo/second-step.png'
import postInfo from '@/static/img/zowoyoo/postinfo.jpg'
import config from '../../utils/config'

export default class Customer extends Component {
  state = {
    text:'',// 文案
    orderId:'', // 订单或商品编号
    link: '', // 外链链接
    authorization:'', // h5的token
    linkType:'' // 外链类型
  }
  handleContact(e) {
    console.log(e.detail.path)
  }
  cancel() {
    Taro.navigateBack()
  }
  onLoad (options) {
    if (options && options.link) {
      // 存在外链信息，type为1是预约外链 2为商品详情外链
      const token = options['X-Authorization']
      this.state.link = decodeURIComponent(options.link)
      this.state.orderId = options.orderid
      this.setState({
        linkType: options.linkType
      },()=>{
        if (options.linkType === '1') {
          this.state.text = `您查看的订单编号${options.orderid}的预约网址为`
        } else if (options.linkType === '2') {
          this.state.text = `点击以下链接继续浏览详情`
        } else if (options.linkType === '3') {
          this.state.text = `领取赚钱秘籍，学习大佬销售业绩倍增营销术`
        }
        Taro.request({
          url: `${config.target}/mtourists-core/wechat/message/outer-link/save`,
          method: 'POST',
          data: {
            content: this.state.text,
            minappOpenid: Taro.getStorageSync('openId'),
            url: this.state.link
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
  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

  componentDidCatchError() {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <View class="customer-body">
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
            send-message-path="/pages/index/index"
            send-message-title="预约信息"
          >
            <View>确认</View>
          </Button>
        </View>
      </View>
    );
  }
}
