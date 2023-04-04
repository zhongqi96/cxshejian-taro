import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Image, Button, Text, Swiper, SwiperItem, Block, Navigator } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { setTrainInfo, setTotalPrice, addGoods } from '@/store/actions'
import dayjs from 'dayjs'
import API from '@/api'
import './index.scss'


import topBg from '@/static/img/index/pic_beijing.png'
import default1 from '@/static/img/index/default-1.png'
import default2 from '@/static/img/index/default-2.png'
import default3 from '@/static/img/index/default-3.png'
// import scroll from '@/static/img/index/scroll.png'

import NoDistanceTopSec from './NoDistanceTopSec/NoDistanceTopSec'
import HasDistanceTopSec from './HasDistanceTopSec/HasDistanceTopSec'

const TD = require('@/utils/tdweapp.js')

// let tdweapp = require('@/utils/tdweapp.js')

type PageStateProps = {
  date: string,
  trainInfo: any,
  userStationInfo: any
}
type PageDispatchProps = {
  setTrainInfo: (any) => any
  setTotalPrice: (any) => any
  addGoods: (any) => any
}

type PageOwnProps = {}

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Index {
  props: IProps;
}

// const defualtRecommend = [
//   {img: default1, url: '', name: '广州必玩景点榜'},
//   {img: default2, url: '', name: '广州美食必吃榜'},
//   {img: default3, url: '', name: '广州热门必逛榜'}
// ]

const tabList = ['旅行爆款', '高铁优选', '当地美食', '亲子热门']

@connect(({ counter }) => ({
  ...counter
}), (dispatch) => ({
  setTrainInfo: (payload) => {
    dispatch(setTrainInfo(payload))
  },
  setTotalPrice: (payload) => {
    dispatch(setTotalPrice(payload))
  },
  addGoods: (payload) => {
    dispatch(addGoods(payload))
  }

}))


class Index extends Component {

  state = {
    goodsList: [],
    recommendList: [],
    positionCity: '', // 用户定位
    areaId: '',
    cityList: [],
    // isSetting: false, // 用户设置
    lat: '',
    lon: '',
    startIndex: 0,
    tabIndex: 1,
    themeId: '',
    excludeThemeId: '101098',
    isGetLocation: false,
    hasDistance: false,
    hideModal: false,
    topAd: [],
    middleAd: [],
    noMoreData: false,
    code: '',
    defaultRecommend: [], // 默认推荐
    currentCity: {}
  }

  onLoad() {
    this.getAdData()
    this.getListData(1)
    let router: any = getCurrentInstance().router
    for (let item in router.params) {
      switch(item) {
        case 'code':
          this.setState({code: router.params[item]});
          break;
        case 'productdynamic':
        case 'product':
        case 'rankinglist':
          this.clickRecommend({toUrl: `${item}-${router.params[item]}`});
      }
    }
  }

  UNSAFE_componentWillMount() {
  }

  componentWillUnmount () { 
    TD.Page.onUnload()
  }

  componentDidShow () {
    this.getDistance() // 获取行程
    TD.Page.onShow()
    // this.getListData(this.state.tabIndex)
    // this.getTrainCityList()
  }

  componentDidHide () {
    TD.Page.onHide()
   }

  onReachBottom() {
    if (this.state.noMoreData) return
    this.setState({
      startIndex: this.state.startIndex + 5
    })
    this.getListData(this.state.tabIndex)
  }

  render () {
    const { hideModal, positionCity, areaId, tabIndex, recommendList, currentCity, hasDistance, goodsList, topAd, middleAd, defaultRecommend } = this.state
    const { trainInfo } = this.props
    return (
      <View className='home-page'>
        {/*<Image src={topBg} className="top-bg"></Image>*/}
        {topAd.length > 0 && <Swiper
          className='top-scroll-box'
          vertical={false}
          autoplay
        >
          {
            topAd.map((item, index) => {
              return (
                <SwiperItem key={'scr'+index}>
                  <Image src={item.imageUrl} className='scroll-img' mode="aspectFill" onClick={() => {this.toAdPage(item)}}></Image>
                </SwiperItem>
              )
            })
          }
        </Swiper>}
        {/* <View className='pay' onClick={this.getPay}>发起支付</View> */}

        <View className={`page-content ${areaId && 'page-content-top'}`}>
          {/*----顶部部分-----*/}
          <View className="top-sec">
            {hasDistance || 
            <NoDistanceTopSec 
              positionCity={positionCity} 
              areaId={areaId} 
              middleAd={middleAd}
            ></NoDistanceTopSec>}
            {hasDistance && 
            <HasDistanceTopSec 
              setCurrentCity={this.setCurrentCity} 
              positionCity={currentCity.cityName} 
              middleAd={middleAd}
              onRef={ref => {this.$child = ref}}
            ></HasDistanceTopSec>}
          </View>

          {/*------当前城市无推荐商品-----*/}
          {defaultRecommend.length > 0 && <View className="city-recommend">
            {
              defaultRecommend.map((item, index) => {
                return (
                  <View className="recommend-item" key={'reco'+index}>
                    <Image src={item.imageUrl} className="recommend-img" mode="aspectFill" onClick={() => {this.clickRecommend(item)}} key={'img'+index}></Image>
                    <Text className="recommend-text">{item.imageDesc}</Text>
                  </View>
                )
              })
            }
          </View>}

          {/*------免费试吃/开卡------*/}
          {/*<View className='sec-middle'>
            <View className='foretaste' onClick={() => {this.toMall({infoId: 28011235})}}>
              <Text className='text'>今日新品发布</Text>
              <Image src={xpfb} className='taste-img' mode="aspectFill" />
            </View>

            <View className='open-card' hoverClass="" onClick={() => {this.toMall({infoId: 28196375})}}>
              <Text className='text'>扶贫助农产品</Text>
              <Image src={fpzn} className='card-img' mode="aspectFill" />
            </View>
          </View>*/}


          {/*------轮播------*/}
          {/*<Swiper
            className='scroll-box'
            vertical={false}
          >
            {
              middleAd.map((item, index) => {
                return (
                  <SwiperItem key={'scr'+index}>
                    <Image src={item.imageUrl} className='scroll-img' mode="aspectFill" onClick={() => {this.toAdPage(item)}}></Image>
                  </SwiperItem>
                )
              })
            }
          </Swiper>*/}

          {/*------乘务美食------*/}
          {hideModal && <View className='crew-food'>
            {goodsList.length > 0 && <View className='title'>
              <Text className='name'>{trainInfo.train}乘务员美食推荐</Text>
              <View className='icon' onClick={this.toCarFood}>更多</View>
            </View>}
            <View className='goods-box'>
              {
                goodsList.map((item, index) => {
                  return (
                    <View className='goods-item' key={'goo'+index} onClick={this.toCarFood}>
                      <Image src={item.thumbImg} className='goods-img' mode="aspectFill"></Image>
                      <Text className='goods-title'>{item.productName}</Text>
                      <View className='goods-msg'>
                        <Text className='price'>¥{(item.price/100).toFixed(2)}</Text>
                        {/*<Text className='pre-price'>¥{item.prePrice}</Text>*/}
                        <Text className='buy-btn'>立即抢购</Text>
                      </View>
                    </View>
                  )
                })
              }
            </View>
          </View>}

          {/*------途径城市-------*/}
          {/*{hasDistance && <View className='road-city'>*/}
          {/*  <View className='name'>途经城市好物推荐</View>*/}
          {/*  <View className='city-list'>*/}
          {/*    {*/}
          {/*      cityList.map((item, index) => {*/}
          {/*        return <Text className={`city ${index === cityIndex && 'active'}`} key={'city'+index} onClick={() => {this.selectCity(item, index)}}>{item.cityName}</Text>*/}
          {/*      })*/}
          {/*    }*/}
          {/*  </View>*/}
          {/*</View>}*/}

          {/*------城市好物推荐------*/}
          <View className="good-recommend">
            <Text className="recommend-title">城市好物推荐</Text>

            {/*------tab切换------*/}
            <View className="tab-list">
              {
                tabList.map((item, index) => {
                  return (
                    <View className={`tab-item ${+tabIndex === index+1 && 'active'}`} onClick={() => this.changeTab(index+1)} key={'tab'+index}>
                      <Text className='tab-text'>{item}</Text>   
                    </View>
                  )
                })
              }
            </View>

            <View className='recommend-list'>
              {
                recommendList.map((item, index) => {
                  return (
                    // <View className={`recommend-item ${item.idDisplay && 'recommend-item-show'}`} key={'re'+index} onClick={() => {this.toMall(item)}}>
                    <View className={`recommend-item recommend-item-show`} key={'re'+index} onClick={() => {this.toMall(item)}}>
                      <Image src={item.signImg} className='recommend-img' mode="aspectFill"></Image>
                      <Text className='recommend-title'>{item.infoTitle}</Text>
                      <View className='recommend-msg'>
                        <Text className='city'>{item.city}</Text>
                        <View className='right-msg'>
                          <Text className='unit'>¥</Text>
                          <Text className='price'>{item.salePrice}</Text>
                          <Text className='unit'>起</Text>
                          <Text className='buy-btn'>立即抢购</Text>
                        </View>
                      </View>
                    </View>
                  )
                })
              }
            </View>
          </View>
        </View>
      </View>
    )
  }

  getPay = () => {
    API.Order.createPayment()
    .then(res => {
        let data = {
          timeStamp: res.data.timeStamp,
          nonceStr: res.data.nonceStr,
          package: res.data.packages,
          signType: res.data.signType,
          paySign: res.data.paySign,
        }
        console.log(data, 111)
        Taro.requestPayment({
          timeStamp: res.data.timeStamp,
          nonceStr: res.data.nonceStr,
          package: res.data.packages,
          signType: res.data.signType,
          paySign: res.data.paySign,
          success () {
            Taro.redirectTo({
              url: `/pages/payResult/index`
            })
          },
          fail () {
            Taro.redirectTo({
              url: `/pages/payResult/index?orderId=${value.orderId}`
            })
          }
        })
      })
  }

  showTip = () => {
    Taro.showToast({
      title: '敬请期待',
      icon: 'none'
    })
  }

  getDistance = () => {
    API.Home.getDistance()
      .then(res => {
        if (res.data) {
          let trainData = res.data
          let obj = {
            date: trainData.date,
            train: trainData.train,
            startStation: trainData.upStationName,
            startTime: trainData.upTrainTime.split(' ')[1],
            // startTime: trainData.trainStartTime,
            duration: trainData.lengthTime,
            endStation: trainData.downStationName,
            endTime: trainData.downTrainTime.split(' ')[1],
            // endTime: trainData.trainEndTime,
            distanceId: trainData.id,
            startLessTime: trainData.startLessTime,
            fullRemainTime: trainData.fullRemainTime
          }
          this.props.setTrainInfo(obj)
          this.setState({
            hasDistance: true,
            // areaId: '1004401',
            // positionCity: '广州市'
          }, () => {
            // this.getListData(this.state.tabIndex)
          })
          // this.getTrainCityList()
          this.$child.getTrainCityList()
          // this.getCityList(trainData.train) // todo
        } else {
          this.setState({
            hasDistance: false
          })
          !this.state.areaId && this.getLocation()
          this.props.setTrainInfo({})
          this.state.code && this.getTrain()
        }
      })
  }

  // 获取车次信息
  getTrain = () => {
    API.Home.getTrain({qrcode: this.state.code})
      .then(res => {
        this.setState({
          hasDistance: !!res.data
        })
        if (res.data) {
          this.props.setTrainInfo(res.data)
          this.$child.getTrainCityList()
          // this.getCityList(res.data.train) // todo
          // this.getCarFood(res.data)
          // this.getTrainCityList()
        }
      })
  }


  setCurrentCity = (city) => {
    this.setState({
      currentCity: city
      // areaId: city.zwyCityId
    }, () => {
      this.getMiddleAdData()
      this.getListData(this.state.tabIndex)
    })
  }

  // 获取位置信息
  getLocation = () => {
    if (this.state.isGetLocation) return
    let _this = this
    this.setState({
      isGetLocation: true
    })
    Taro.getSetting({
      success: res => {
        if (!res.authSetting['scope.userLocation']) {
          Taro.authorize({
            scope: 'scope.userLocation',
            success () {
              // 用户同意打开地理位置
              Taro.getLocation({
                success: val => {
                  _this.setState({
                    lat: val.latitude,
                    lon: val.longitude
                  }, () => {
                    _this.getLocationCity()
                  })
                }
              })
            },
            fail() {
              _this.getAdData()
              // _this.setState({
              //   isSetting: false
              // })
            },
            complete() {
              _this.setState({
                isGetLocation: false
              })
            }

          })
        } else {
          Taro.getLocation({
            success: response => {
              _this.setState({
                lat: response.latitude,
                lon: response.longitude
              }, () => {
                _this.getLocationCity()
              })

              // 通过坐标值获取城市
            },
            fail: () => {
              _this.getAdData()
            },
            complete() {
              _this.setState({
                isGetLocation: false
              })
            }
          })
        }
      }
    })
  }

  // 获取当前城市的城市ID
  getLocationCity = () => {
    if (this.state.hasDistance) return
    let data = {
      latitude: this.state.lat,
      longitude: this.state.lon
    }
    API.Home.getLocationCity(data)
      .then(res => {
        this.setState({
          positionCity: res.data.areaName,
          areaId: res.data.areaId + ''
        }, () => {
          this.getAdData()
          this.getListData(this.state.tabIndex)
        })
      })
  }

  // 请求推荐商品列表
  getListData = (index) => {
    if (this.state.noMoreData) return
    let loading = this.state.startIndex > 1
    let areaId = this.state.areaId
    let data = {
      resultNum: 5,
      startIndex: this.state.startIndex,
      areaId,
      themeId: this.state.themeId,
      excludeThemeId: this.state.excludeThemeId
    }
    API.Home.getListData(data, loading)
    .then(res => {
      let list = res.data && res.data.results || []
      // let recList = this.state.recommendList.concat(res.data && res.data.results)
      let recList: any[] = []
      if (this.state.startIndex > 1) {
        recList = [...this.state.recommendList, ...list]
      } else {
        recList = [...list]
      }

      if (this.state.tabIndex !== index) {
        recList = []
      }
      let length = res.data ? res.data.results.length : 0
      this.setState({
        noMoreData: length < 5,
        recommendList: recList
      })
    })
  }

  clickRecommend = (item) => {
    let canTo = false
    if (item.toUrl && item.toUrl.split('-')[0] === 'rankinglist') {
      let city = this.state.positionCity
      if (+item.type === 1) {
        city = '广州'
      }
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

  // 广告页跳转
  toAdPage = (ad) => {
    if (ad.toUrl && ad.toUrl.split('-')[0] === 'storeId') {
      Taro.navigateToMiniProgram({
        appId: 'wxfc478628cf4f2c73',
        path: `/pages/shop/index?storeId=${ad.toUrl.split('-')[1]}`
      })
    } else if (+ad.linkType === 1 && ad.toUrl) {
      ad.toUrl && Taro.navigateTo({
        url: `/pages/adPage/index?url=${ad.toUrl}`
      })
    }
  }

  // 切换商品推荐列表
  changeTab = (index) => {
    let theme = ['',  '101098', '101032', '101100'] // 2 || 3 || 4
    let themeId = theme[index-1]
    let excludeThemeId = index === 1 ? '101098' : ''  // 1
    this.setState({
      tabIndex: index,
      themeId,
      excludeThemeId,
      startIndex: 0,
      noMoreData: false
    })
    this.getListData(index)
  }

  // 城市列表
  getCityList = (train) => {
    API.Home.getCityList({train})
      .then(res => {
        // let id = this.state.areaId
        // let index: number = res.data.findIndex(item => {
        //   return item.zwyCityId === id
        // })
        this.setState({
          cityList: res.data || [],
        })
      })
  }

  // 广告
  getAdData = () => {
    // 广告标识code定义
    // 首页顶部：home-head
    // 首页中部：home-middle
    // 下单支付成功页面：pay-success
    // 车厢美食：train-banner
    let areaId = this.state.areaId
    Promise.all([API.Home.getAdData({code: 'home-head', zwyAreaId: areaId}), API.Home.getAdData({code: 'home-middle', zwyAreaId: areaId})])
      .then(res => {
        let middleAd: any[] = res[1].data ? res[1].data.bannerImgList : []
        let type: number = 0
        if (res[1].data && res[1].data.bannerImgList[1] && +res[1].data.bannerImgList[1].type === 1) {
          type = 1
        }
        this.setState({
          topAd: res[0].data ? res[0].data.bannerImgList : [],
          middleAd: type ? [] : middleAd,
          defaultRecommend: type ? middleAd : []
        }, () => {
          // console.log(type, this.state.middleAd, this.state.defaultRecommend, res[1].data.bannerImgList)
        })
      })
  }

  getMiddleAdData = () => {
    API.Home.getAdData({code: 'home-middle', zwyAreaId: this.state.currentCity.zwyCityId})
      .then(res => {
        if (res.data) {
          let middleAd: any[] = res.data.bannerImgList
          let type: number = 0
          if (res.data.bannerImgList[1] && +res.data.bannerImgList[1].type === 1) {
            type = 1
          }
          this.setState({
            middleAd: type ? [] : middleAd,
            defaultRecommend: type ? middleAd : []
          }, () => {
            // console.log(type, this.state.middleAd, this.state.defaultRecommend, res.data.bannerImgList)
          })
        }
        
      })
  }

  // 车厢推荐商品列表
  getCarFood = (trainInfo) => {
    let data = {
      carriageRange: trainInfo.cid,
      train: trainInfo.train,
      trainDate: this.props.date
    }
    API.CarFood.getCarData(data)
      .then(res => {
        let cid = trainInfo.cid
        let products = (res.data && res.data[cid === 'A' ? 'frontTrainProducts' : 'backTrainProducts']) || []
        let arr = products.map(item => {
          return item.products
        })
        let goodsList: any = []
        arr.forEach(item => {
          item.forEach(goods => {
            goodsList.push(goods)
          })
        })
        this.setState({
          goodsList: goodsList.slice(0, 2)
        })
      })
  }

  // 跳转车厢美食推荐
  toCarFood = () => {
    Taro.navigateTo({
      url: '/pages/carFood/index'
    })
  }

  // 跳转到提交订单页
  toAccount = (item) => {
    let goods = [
      {
        productName: item.infoTitle,
        price: item.salePrice,
        number: 1,
        thumbImg: item.signImg
      }
    ]
    this.props.setTotalPrice(item.salePrice)
    this.props.addGoods(goods)
    // Taro.setStorageSync('goods', goods)
    let startStation = this.props.userStationInfo.startStation
    if(!startStation) {
      let train = this.props.trainInfo.train
      Taro.navigateTo({
        url: `/pages/orderSelectSite/index?trainNo=${train}`
      })
      return
    }
    Taro.navigateTo({
      url: '/pages/createOrder/index'
    })
  }

  // 跳转商城商品详情
  toMall = (item) => {
    let infoId = item.infoId
    infoId && Taro.setStorageSync('infoId', infoId)
    Taro.switchTab({
      url: `/pages/mall/index`
    })
  }
}

export default Index

