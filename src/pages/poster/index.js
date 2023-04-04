import React, { Component } from "react";
import { View, Button, Image, Text } from "@tarojs/components";
import Taro,{showToast} from '@tarojs/taro'
import "./index.scss";
import copyImg from '@/static/img/zowoyoo/copy.png'
import shareImg from '@/static/img/zowoyoo/poster-share.png'
import downInmg from '@/static/img/zowoyoo/poster-download.png'
export default class Poster extends Component {
  state = {
    showToast: false,
    money: '',
    posterUrl: '',
    localPath: '', // 图片的本地路径
    shareImg: '',
    shareTitle: '',
    productId: '',
    shareId: '',
    custId: '',
    contentData: '',
    contentLink: '',
    third: '',
    siteId: ''
  }
  onLoad (options) {
    Taro.setNavigationBarTitle({
      title: '分享给好友'
    })
    console.log(JSON.stringify(options))
    let posterUrl = decodeURIComponent(options.dialogUrl)
    console.log(posterUrl)
    this.setState({
      money: options.money,
      posterUrl: posterUrl,
      shareTitle: decodeURIComponent(options.title),
      shareImg: decodeURIComponent(options.img),
      productId: options.id,
      shareId: options.share,
      custId: options.cust,
      contentData: decodeURIComponent(options.title),
      contentLink: (decodeURIComponent(options.shareLink) || ''),
      third: options.third || '',
      siteId: options.siteId
    })
    Taro.getImageInfo({
      src: posterUrl,
      success: res => {
        this.state.localPath = res.path
      }
    })
  }
  downloadPoster =() => {
    // 下载海报
    // 获取用户授权
    Taro.getSetting({
      success: res => {
        if (res.authSetting['scope.writePhotosAlbum']) {
          // 已经授权， 可以直接调用 saveImageToPhotosAlbum 保存图片到相册， 不会弹框
          Taro.saveImageToPhotosAlbum({
            filePath: this.state.localPath,
            success: () => {
              if (getApp().globalData.systemInfo.platform === 'android') {
                console.log(getApp().globalData.systemInfo)
              } else {
                Taro.showToast({
                  title: '保存成功',
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            fail: () => {
              console.log(this.state.posterUrl)
              Taro.showToast({
                title: '保存失败',
                icon: 'none',
                duration: 2000
              })
            }
          })
        } else {
          Taro.saveImageToPhotosAlbum({
            filePath: this.state.localPath,
            success: () => {
              // if (getApp().globalData.systemInfo.platform === 'android') {
              //   console.log(getApp().globalData.systemInfo)
              // } else {
                Taro.showToast({
                  title: '保存成功',
                  icon: 'none',
                  duration: 2000
                })
              // }
            },
            fail: () => {
              console.log(this.state.posterUrl)
              Taro.showToast({
                title: '保存失败，请在设置中\n打开相册权限',
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
      }
    })
  }
  copyContent =() => {
    Taro.setClipboardData({
      data: this.state.contentData + this.state.contentLink,
      success() {
      }
    })
  }
  onShareAppMessage() {
    let onShareImg = ''
    if (!/\.(jpg|jpeg|png|JPG|PNG)$/.test(this.state.shareImg)) {
      onShareImg = this.state.posterUrl
    } else {
      onShareImg = this.state.shareImg
    }
    if (this.state.third === 'union') {
      console.log(`/pages/mall/index?shareId=${this.state.shareId}&custId=${this.state.custId}&page=thridproduct&infoId=${this.state.productId}&environmental=t&siteId=6`)
      return {
        title: this.state.shareTitle,
        imageUrl: onShareImg,
        path: `/pages/mall/index?shareId=${this.state.shareId}&custId=${this.state.custId}&page=thridproduct&infoId=${this.state.productId}&environmental=t&siteId=6`
      }
    } else {
      console.log(`/pages/mall/index?shareId=${this.state.shareId}&custId=${this.state.custId}&page=thridproduct&infoId=${this.state.productId}&environmental=t&siteId=6`)
      return {
        title: this.state.shareTitle,
        path: `/pages/mall/index?shareId=${this.state.shareId}&custId=${this.state.custId}&page=product&infoId=${this.state.productId}&environmental=t&siteId=6`,
        imageUrl: onShareImg
      }
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
      <View class="poster-body">
        <View class="poster-section">
          <View class="title">
            {/* <View wx:if="{showToast}" class="copy-toast">
              文案已复制，可直接粘贴
            </View> */}
          </View>
          <View class="poster-section-content">
            <Image class="img" mode="widthFix" src={this.state.posterUrl}></Image>
          </View>
          <View class="product-title">
            <Text class="product-title-content">{this.state.contentData}</Text>
            <Text class="product-title-link">{this.state.contentLink}</Text>
            <View class="copy-box" onClick={this.copyContent}>
              <Image class="copy-btn" src={copyImg}></Image>
              <Text>复制文案</Text>
            </View>
          </View>
          <View class="poster-section-bottom">
            <View class="bottom-left">
              <View>
                只要你的朋友通过你的链接或海报购买，你就能赚到
                <Text class="commission">{this.state.money}</Text> 元，一次锁定长期受益
              </View>
            </View>
            <View class="bottom-right">
              <Button plain="true" open-type="share">
                <Image class="share" src={shareImg}></Image>
              </Button>
              <Image
                class="download"
                src={downInmg}
                onClick={this.downloadPoster}
              ></Image>
            </View>
          </View>
        </View>
      </View>
    );
  }
}
