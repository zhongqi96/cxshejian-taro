import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Text, Image } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import API from '@/api'
// import { add, minus, asyncAdd } from '../../store/actions'

import './index.scss'

// import noodle from '@/static/img/goodsList/noodle.jpg'
import dingwei from '@/static/img/goodsList/dingwei.png'
import biaoqian from '@/static/img/goodsList/biaoqian.png'
import backIcon from '@/static/img/goodsList/back.png'

type PageStateProps = { }

type PageDispatchProps = { }

type PageOwnProps = {}

type PageState = { }

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface RankList { props: IProps; }

// const defaultRankList: Array<any> = [
//   {
//     img: noodle,
//     title: '点都德',
//     city: '广州',
//     tag: ['#十分nice', '#环境优美', '#资深吃货必备'],
//     detail: '金沙红米肠外皮脆酥'
//   },
//   {
//     img: noodle,
//     title: '点都德',
//     city: '广州',
//     tag: ['#十分nice', '#环境优美', '#资深吃货必备'],
//     detail: '金沙红米肠外皮脆酥'
//   }
// ]

@connect(({ counter }) => ({
  ...counter
}), () => ({

}))
class RankList extends Component {
  state = {
    id: '',
    rankData: {},
    rankList: [],
    city: '',
    hasTop: false
  }

  onLoad() {
    Taro.getSystemInfo({
      success: res => {
        let statusBar = res.statusBarHeight //状态栏高度
        let custom = Taro.getMenuButtonBoundingClientRect()//菜单按钮
        console.log(statusBar, custom)
        this.setState({
          hasTop: statusBar > 40
        })
      }
    })
  }

  UNSAFE_componentWillMount() {
    let router: any = getCurrentInstance().router
    let id = router.params.id
    let city = router.params.city
    if (id) {
      this.setState({
        id,
        city
      }, () => {
        this.getRankList()
      })
    } else {
      Taro.navigateBack({
        delta: 1
      })
    }
    
  }

  componentDidShow () {

  }

  componentDidHide () { }

  render () {
    const { rankList, rankData, city, hasTop } = this.state
    return (
      <View className='rank-list'>
        <Image src={backIcon} className={`back-icon ${hasTop && 'back-icon-top'}`} mode="aspectFill" onClick={this.pageBack}></Image>
        <Image src={rankData.imageUrl} className="top-bg" mode="aspectFill"></Image>
        <View className="rank-content">
          {
            rankList.map((item, index) => {
              return (
                <View className="rank-item" key={'rank'+index} onClick={() => {this.toProduct(item.toUrl)}}>
                  <View className="rank-main">
                    <Image src={item.imageUrl} className="item-img" mode="aspectFill"></Image>
                    <View className="item-context">
                      <View className="item-title">
                        <Text className="title">{item.name}</Text>
                        {city && <View className="title-right">
                          <Image src={dingwei} className="right-icon"></Image>
                          <Text className="city-name">{city}</Text>
                        </View>}
                      </View>

                      <View className="tag-list">
                        {
                          item.tag.split(',').map((tag, ind) => {
                            return <Text className="tag" key={'tag'+ind}>{tag}</Text>
                          })
                        }
                      </View>

                      <Text className="item-detail">{item.comment}</Text>
                    </View>
                  </View>
                  <View className="top-icon">
                    <Image src={biaoqian} className="icon-bg" mode="aspectFill"></Image>
                    <Text className="icon-number">{index + 1}</Text>
                  </View>

                </View>
              )
            })
          }
        </View>
      </View>
    )
  }

  // 获取榜单列表
  getRankList = () => {
    API.Home.getRankList({id: this.state.id})
      .then(res => {
        if (res.data) {
          Taro.setNavigationBarTitle({
            title: 'res.data.name'
          })
          this.setState({
            rankList: res.data.placardProductVos,
            rankData: res.data
          })
        }
      })
  }
  // 点击榜单跳转
  toProduct = (url) => {
    let canTo = false
    if(url.split('-')[0] === 'product') {
      Taro.setStorageSync('infoId', url.split('-')[1])
      canTo = true
    } else if (url.split('-')[0] === 'productdynamic') {
      Taro.setStorageSync('productdynamic', url.split('-')[1])
      canTo = true
    }
    canTo && Taro.switchTab({
      url: `/pages/mall/index`
    })
  }

  pageBack = () => {
    Taro.navigateBack({
      delta: 1
    })
  }
}

export default RankList

