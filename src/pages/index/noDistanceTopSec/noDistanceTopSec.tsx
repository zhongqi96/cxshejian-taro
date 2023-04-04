import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Button, Image, Text } from '@tarojs/components'
import { connect } from 'react-redux'
import API from '@/api'

import './noDistanceTopSec.scss'

import addIcon from '@/static/img/index/icon_tianjia.png'
import rightIcon from '@/static/img/index/you.png'
import czdp from '@/static/img/index/icon_czdp-2.png'
import skcx from '@/static/img/index/icon_skcx-2.png'
import lxsc from '@/static/img/index/icon_lxsc-2.png'
import jrsx from '@/static/img/index/icon_jrsx-2.png'
// import default1 from '@/static/img/index/default-1.png'
// import default2 from '@/static/img/index/default-2.png'
// import default3 from '@/static/img/index/default-3.png'

type PageStateProps = {
  positionCity: string,
  areaId: any,
  middleAd: any,
  setLocationCity: any
}
type PageDispatchProps = {

}

type PageOwnProps = {

}

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps


interface NoDistanceTopSec {
  props: IProps;
}

const BUTTON_LIST = [
  {
    img: czdp,
    name: '车站大屏',
    url: '/page/pages/switchStation/index'
  },
  {
    img: skcx,
    name: '时刻查询',
    url: '/page/pages/add/index'
  },
  {
    img: lxsc,
    name: '旅行商城',
    url: '/tab/pages/mall/index'
  },
  {
    img: jrsx,
    name: '今日上新',
    url: '/mall/pages/mall/index'
  }
]

// const defualtRecommend = [
//   {img: default1, url: '', name: '广州必玩景点榜'},
//   {img: default2, url: '', name: '广州美食必吃榜'},
//   {img: default3, url: '', name: '广州热门必逛榜'}
// ]

@connect(({counter}) => ({
  ...counter
}), () => ({

}))

class NoDistanceTopSec extends Component {
  state = {
    buttonList: BUTTON_LIST,
    hasRecommend: false
  }

  onLoad() {

  }

  UNSAFE_componentWillMount() {
  }

  componentWillUnmount () { }

  componentDidHide () { }

  render() {
    const { buttonList, hasRecommend } = this.state
    const { positionCity, middleAd }  = this.props
    // const { } = this.props

    return (
      <View className="no-distance">
        <Text className="title">Hi，尊敬的会员</Text>
        <View className="distance-tip" onClick={this.toAddDistance}>
          <Image src={addIcon} className="add-icon" mode="aspectFill"></Image>
          <Text className="tip-text">添加行程，随时查看出行信息</Text>
          <Image src={rightIcon} className="right-icon" mode="aspectFill"></Image>
        </View>

        {/*------按钮------*/}
        <View className='inter-list'>
          {
            buttonList.map((item, i) => {
              return (
                <View className='inter-item' key={'icon'+i} onClick={() => {this.toPage(item)}}>
                  <Image src={item.img} className='icon' mode="aspectFill"></Image>
                  <Text className='name'>{item.name}</Text>
                </View>
              )
            })
          }
        </View>

        {/*------定位------*/}
        <View className={`fixed-position ${positionCity && 'active'} ${middleAd.length > 0 && 'has-recommend'}`}>
          <Text>{positionCity ? '当前定位: ' + positionCity : '当前未获取定位权限，请在'}</Text>
          {!!positionCity || <Button openType="openSetting" className="setting">设置</Button>}
          {!!positionCity || <Text>中打开</Text>}
        </View>

        {/*------当前城市有推荐商品-----*/}
        {middleAd.length > 0 && <View className="city-recommend">
          {
            middleAd.map((item, index) => {
              return (
                <View className="recommend-item" key={'reco'+index} onClick={() => {this.clickRecommend(item, index)}}>
                  <Image src={item.imageUrl} className="recommend-img" mode="aspectFill" key={'img'+index}></Image>
                  <Text className="recommend-text">{item.imageDesc}</Text>
                </View>
              )
            })
          }
        </View>}


      </View>
    )
  }

  toAddDistance = () => {
    Taro.navigateTo({
      url: '/pages/add/index'
    })
  }


  // 跳转页面
  toPage = (page) => {
    // 跳小程序页面和h5页面
    // if (page.url.includes('/info')) {
    //   Taro.setStorageSync('hotRecommend', 1)
    //   Taro.switchTab({
    //     url: page.url.replace('/info', '')
    //   })
    // }
    if (page.url.includes('/tab')) {
      Taro.setStorageSync('preference', 1)
      Taro.switchTab({
        url: page.url.replace('/tab', '')
      })
    } else if (page.url.includes('/page/pages')) {
      Taro.navigateTo({
        url: page.url.replace('/page', '')
      })
    } else if (page.url.includes('/mall/pages')) {
      Taro.setStorageSync('today', 1)
      Taro.switchTab({
        url: page.url.replace('/mall', '')
      })
    }
    // else if (page.url) {
    //   Taro.navigateTo({
    //     url: `/pages/adPage/index?url=${page.url}`
    //   })
    // }
  }

  clickRecommend = (item, index) => {
    let canTo = false
    if (item.toUrl && item.toUrl.split('-')[0] === 'rankinglist') {
      let city = this.props.positionCity
      if (+item.type === 1) {
        city = '广州'
      }
      // Taro.navigateTo({
      //   url: '/pages/rankList/index'
      // })
      Taro.navigateTo({
        url: `/pages/rankList/index?id=${item.toUrl.split('-')[1]}&city=${city}`
      })
    } else if(item.toUrl && item.toUrl.split('-')[0] === 'product') {
      Taro.setStorageSync('infoId', item.toUrl.split('-')[1])
      canTo = true
    } else if (item.toUrl && item.toUrl.split('-')[0] === 'productdynamic') {
      Taro.setStorageSync('productdynamic', item.toUrl.split('-')[1])
      canTo = true
    }
    canTo && Taro.switchTab({
      url: `/pages/mall/index`
    })
  }
}

export default NoDistanceTopSec
