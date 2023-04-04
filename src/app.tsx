import React, { Component } from 'react'
import { Provider } from 'react-redux'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import configStore from '@/store'
import API from '@/api'

import './app.scss'

const store = configStore()

const TD = require('@/utils/tdweapp.js')

class App extends Component {

  componentDidMount () {}

  onLaunch(options) {
    TD.App.onLaunch(options)
    Taro.login({
      success: val => {
        let code = val.code
        API.Global.login({code})
          .then(res => {
            Taro.setStorageSync('token', res.data)
            API.Global.getUserInfo()
              .then(info => {
                info.data.openId && Taro.setStorageSync('openId', info.data.openId)
              })
          })
      },
      fail: data => {
        console.log(data, '静默授权失败')
      }
    })
    // TD.launch({
    //   appkey: '1B4CB238B43B4B5C9648E0F8F380FA8E',
    //   appName: '畅行舌尖小程序',
    //   versionName: '1.0.0',
    //   versionCode: 'versionCode',
    //   wxAppid: 'wx18f8259aecab011a',
    //   getLocation: false, // 默认不获取用户位置
    //   autoOnPullDownRefresh: false, // 默认不统计下拉刷新数据
    //   autoOnReachBottom: false // 默认不统计页面触底数据
    // })
    // Taro.getUpdateManager().onCheckForUpdate(res => {
    //   if (res.hasUpdate) {
    //     //新版本下载完成
    //     Taro.getUpdateManager().onUpdateReady(() => {
    //       Taro.showModal({
    //         title: '小程序更新提示',
    //         content: '新版本已经准备好，单击确定重启应用',
    //         showCancel: false,
    //       }).then(modalConfirm => {
    //         if (modalConfirm.confirm) {
    //           if (res.confirm) {
    //             // 新的版本已经下载完成，请重启
    //             Taro.getUpdateManager().applyUpdate();
    //           }
    //         }
    //       });
    //     });
    //
    //     //新版本下载失败
    //     Taro.getUpdateManager().onUpdateFailed(function () {
    //       Taro.showModal({
    //         title: '提示',
    //         content: '检查到有新版本，但下载失败，请检查网络设置',
    //         showCancel: false,
    //       });
    //     });
    //   }
    // });
  }

  componentDidShow (options) {
    TD.App.onShow(options)
  }

  componentDidHide () {
    TD.App.onHide()
  }

  componentDidCatchError () {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Provider store={store}>
        {this.props.children}
      </Provider>
    )
  }
}

export default App
