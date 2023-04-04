import React, { Component } from "react";
import { View,Button } from "@tarojs/components";
import Taro from '@tarojs/taro'
import "./index.scss";

export default class Guide extends Component {
  state = {
    openid: ''
  }
  onLoad (options) {
    var action = options.action;
    if (typeof (action) != 'undefined' && action != 'undefined' && action == 'guide') {
      //导购助手处理。
      this.setState({
        openid: options.openid
      })
    }
  }
  goToThird() {
    Taro.navigateToMiniProgram({
      appId: 'wx72eee61e991e65a1',
      path: `pages/list/list?user_openid=${this.state.openid}`,
      envVersion: 'release',
      success() {
        // 打开成功
      }
    });
  }
  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

  componentDidCatchError() {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <View class="guide">
        <Button class="customer-sure" onClick={this.goToThird}>
          <View>打开微信导购助手</View>
        </Button>
      </View>
    );
  }
}
