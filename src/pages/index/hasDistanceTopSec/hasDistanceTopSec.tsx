import React, { Component } from 'react'
// import Taro from '@tarojs/taro'
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import dayjs from 'dayjs'
import API from '@/api'
import './hasDistanceTopSec.scss'

import zyIcon from '@/static/img/index/icon_zy.png'
import zyActiveIcon from '@/static/img/index/icon_zy-active.png'
import czdpIcon from '@/static/img/index/icon_czdp.png'
import skcxIcon from '@/static/img/index/icon_skcx.png'
import lxscIcon from '@/static/img/index/icon_lxsc.png'
import jrsxIcon from '@/static/img/index/icon_jrsx.png'
// import default1 from '@/static/img/index/default-1.png'
// import default2 from '@/static/img/index/default-2.png'
// import default3 from '@/static/img/index/default-3.png'
import beijing from '@/static/img/cityIcon/beijing.png'
import changsha from '@/static/img/cityIcon/changsha.png'
import guangzhou from '@/static/img/cityIcon/guangzhou.png'
import guiyang from '@/static/img/cityIcon/guiyang.png'
import hangzhou from '@/static/img/cityIcon/hangzhou.png'
import kunming from '@/static/img/cityIcon/kunming.png'
import shanghai from '@/static/img/cityIcon/shanghai.png'
import shenzhen from '@/static/img/cityIcon/shenzhen.png'
import wuhan from '@/static/img/cityIcon/wuhan.png'
import xiamen from '@/static/img/cityIcon/xiamen.png'
import xian from '@/static/img/cityIcon/xian.png'
import zhengzhou from '@/static/img/cityIcon/zhengzhou.png'

type PageStateProps = {
  trainInfo: any,
  positionCity: string,
  middleAd: Array<any>
}
type PageDispatchProps = {
  setCurrentCity: (any) => any,
  onRef: (any) => void
}

type PageOwnProps = {

}

// type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps


interface HasDistanceTopSec {
  props: IProps;
}

const fixedButton = [
  {
    img: czdpIcon,
    name: '车站大屏',
    url: '/page/pages/switchStation/index'
  },
  {
    img: skcxIcon,
    name: '时刻查询',
    url: '/page/pages/add/index'
  },
  {
    img: lxscIcon,
    name: '旅行商城',
    url: '/tab/pages/mall/index'
  },
  {
    img: jrsxIcon,
    name: '今日上新',
    url: '/mall/pages/mall/index'
  }
]

const cityIcon = [
  { city: '北京市', icon: beijing },
  { city: '长沙市', icon: changsha },
  { city: '广州市', icon: guangzhou },
  { city: '贵阳市', icon: guiyang },
  { city: '杭州市', icon: hangzhou },
  { city: '昆明市', icon: kunming },
  { city: '上海市', icon: shanghai },
  { city: '深圳市', icon: shenzhen },
  { city: '武汉市', icon: wuhan },
  { city: '厦门市', icon: xiamen },
  { city: '西安市', icon: xian },
  { city: '郑州市', icon: zhengzhou }
]

@connect(({counter}) => ({
  ...counter
}), () => ({

}))

class HasDistanceTopSec extends Component {
  state = {
    showBoll: false,
    week: ['周日','周一','周二','周三','周四','周五','周六'],
    cityIndex: 1,
    areaId: 1,
    cityList: [],
    cityTempList: [],
    currentCity: {},
    timer: 1,
    scrollLeft: '',
    touch: false,
    changeStateTime: 0,
    isEnd: true
  }

  UNSAFE_componentWillMount() {
    this.props.onRef(this)
  }

  componentWillUnmount () { }

  componentDidShow () {

  }

  componentDidHide () { }

  render() {
    const { showBoll, week, cityIndex, cityList, cityTempList, currentCity } = this.state
    const { trainInfo, middleAd } = this.props
    return (
      <View className="has-distance">
        <View className="top-content">
          {/*-----悬浮按钮-------*/}
          <View className="fixed-boll">
            {showBoll || <Image src={zyIcon} className="main-boll" onClick={this.clickBoll}></Image>}
            {showBoll && <Text className={`main-boll ${showBoll && 'active'}`} onClick={this.clickBoll}>收起</Text>}
            <View className={`boll-menu-bg ${showBoll ? 'active' : ''}`}></View>
            {
              fixedButton.map((item, index) => {
                return (
                  <View className={`boll-item boll-item${index+1} ${showBoll ? 'active' : ''}`} key={'boll'+index} onClick={() => {this.toPage(item)}}>
                    <Image src={item.img} className="boll-img" mode="aspectFill"></Image>
                    <Text className="boll-text">{item.name}</Text>
                  </View>
                )
              })
            }
          </View>
          {/*------车票信息------*/}
          <View className='ticket'>
            <View className='top-msg'>
              <Text className='date'>{dayjs().format('MM月DD日')} {week[dayjs().day()]}</Text>
              {/* <Text className="customer-name">小小</Text> */}
              {(trainInfo.startLessTime || trainInfo.fullRemainTime) && <Text className='tip-text'>{trainInfo.startLessTime || trainInfo.fullRemainTime}</Text>}
            </View>
            <View className='bottom-msg'>
              <View className='left-msg'>
                <Text className='name'>{trainInfo.startStation}</Text>
                <Text className='time'>{trainInfo.startTime}</Text>
              </View>
              <View className='center-msg'>
                <Text className='train'>{trainInfo.train}</Text>
                <Text className='icon'></Text>
                <Text className='long-time'>{trainInfo.duration}</Text>
              </View>
              <View className='right-msg'>
                <Text className='name'>{trainInfo.endStation}</Text>
                <Text className='time'>{trainInfo.endTime}</Text>
              </View>
            </View>
            {trainInfo.seat && <View className="foot-msg">
              <View className="foot-left">
                <Text className='small-text'>席别</Text>
                <Text className='big-text'>{trainInfo.seat}</Text>
              </View>
              <View className="foot-right">
                <Text className='small-text'>座位号</Text>
                <Text className='big-text'>{trainInfo.seat}</Text>
              </View>
            </View>}
            <Text className='bottom-space'></Text>
          </View>

          {/*------途径城市-------*/}
          {cityList.length > 0 && <View className={`road-city ${middleAd.length > 0 && 'has-recommend'}`}>
            {/*<View className='name'>途经城市好物推荐</View>*/}
            <Text className='city-context'>{currentCity.strokDesc || currentCity.scheduleDesc}</Text>
            <View className="city-content begin-city">
              <View className="city-icon"></View>
              <Text className="city-name">{cityList[0].stationName}</Text>
            </View>
            <View className="city-scroll-box">
              {/* <View className='city-list' style={{width: 140 * cityList.length+'rpx', transform: `translateX(-${(cityIndex - 1) * 140 - 20}rpx)`}}> */}
              <Swiper 
                className='city-list'
                circular={false}
                duration={300}
                displayMultipleItems={3}
                current={cityIndex - 1}
                onChange={this.changeSwiper}
                // onTransition={this.swiperTrans}
                onAnimationfinish={this.swiperAnim}>
                {
                  cityTempList.map((item, index) => {
                    return (
                      <SwiperItem key={'city'+index} className="swiper-item" style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        transform: `translate(${index}00%, 0px) translateZ(0px)`
                      }}>
                        <View className="city"  id={'city'+index} onClick={() => {this.selectCity(item, index)}}>
                          <View className={`city-content ${index === cityIndex && 'active'}`}>
                            <View className={`city-icon ${!currentCity.icon && index === cityIndex && 'background'}`}>
                              {(index === cityIndex || index === 0) && <View className="city-line-left"></View>}
                              {item.scheduleDesc && index !== cityIndex &&  <Text className="train-info">{item.scheduleDesc}</Text>}
                              <Image src={currentCity.icon} className="city-img" mode="aspectFit"></Image>
                              {index !== cityIndex - 1 && <View className="city-line-right"></View>}
                            </View>
                            <Text className={`city-name ${(index === 0 || index === cityTempList.length - 1) && 'transparent'}`}>{item.stationName}</Text>
                          </View>
                        </View>
                      </SwiperItem>
                    )
                  })
                }
              </Swiper>
            </View>

            <View className="city-content end-city">
              <View className="city-icon"></View>
              <Text className="city-name">{cityList[cityList.length-1].stationName}</Text>
            </View>
          </View>}

          {cityList.length > 0 && middleAd.length > 0 && <View className="white-bg"></View>}

          {/*------当前城市有推荐商品-----*/}
          {middleAd.length > 0 && <View className="city-recommend">
            {
              middleAd.map((item, index) => {
                return (
                  <View className="recommend-item" key={'reco'+index} onClick={() => {this.clickRecommend(item, index)}}>
                    <Image src={item.imageUrl} className="recommend-img" mode="aspectFill"></Image>
                    <Text className="recommend-text">{item.imageDesc}</Text>
                  </View>
                )
              })
            }
          </View>}
        </View>

      </View>
    )
  }

  // 悬浮球被点击
  clickBoll = () => {
    this.setState({
      showBoll: !this.state.showBoll
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

  // 广告页跳转
  toAdPage = (ad) => {
    ad && Taro.navigateTo({
      url: `/pages/adPage/index?url=${ad}`
    })
  }

  // 获取行程途径城市
  getTrainCityList = () => {
    let trainInfo = this.props.trainInfo
    let data = {
      scheduleId: trainInfo.distanceId || '',
      train: trainInfo.train,
      // train: 'G1315',
      trainDate: dayjs().format('YYYY-MM-DD')
    }
    API.Home.getTrainCityList(data)
      .then(res => {
        if (!res.data) return
        let arr = JSON.parse(JSON.stringify(res.data))
        let start = arr[0]
        let end = arr[res.data.length -1]
        arr.push(end)
        arr.unshift(start)
        // 查找有标识的城市（下一站或当前）
        let currentItem = res.data.filter(item => {
          return item.strokDesc
        })[0]
        if (currentItem) {
          // 查找有标识的城市index
          let cityIndex = cityIcon.findIndex(item => {
            return currentItem.cityName.includes(item.city)
          })
          let currentIndex = res.data.findIndex(item => {
            return currentItem.stationName.includes(item.stationName)
          })
          let currentCity = cityIndex > -1 ? Object.assign(currentItem, cityIcon[cityIndex]) : currentItem
          this.setState({
            cityList: res.data,
            cityTempList: arr,
            currentCity,
            cityIndex: currentIndex > -1 ? currentIndex+1 : 1,
            // scrollLeft: (currentIndex > -1 ? currentIndex * 152.5 + 10 : 152.5 + 10) + 'rpx'
          }, () => {
            this.props.setCurrentCity(currentCity)
          }) 
        } else {
          this.setState({
            cityList: res.data,
            cityTempList: arr,
            currentCity: res.data[0]
          }, () => {
            this.props.setCurrentCity(res.data[0])
          })
        }
      })
  }

   // 选择城市
   selectCity(city, index) {
    if (index === 0 || index === this.state.cityTempList.length - 1) return
    this.setState({
      isEnd: false
    })
    let cityIndex = cityIcon.findIndex(item => {
      return city.cityName && city.cityName.includes(item.city)
    })
    let currentIndex = this.state.cityList.findIndex(item => {
      return city.stationName.includes(item.stationName)
    })
    let currentCity = cityIndex > -1 ? Object.assign(city, cityIcon[cityIndex]) : city
    this.setState({
      cityIndex: currentIndex + 1,
      currentCity,
      // scrollLeft: (currentIndex > -1 ? currentIndex * 152.5 + 10 : 152.5 + 10) + 'rpx'
    }, () => {
      this.props.setCurrentCity(currentCity)
    })
    setTimeout(() => {
      this.setState({
        isEnd: true
      })
    }, 200)
  }

  changeSwiper = (e) => {
    if (this.state.isEnd) {
      let index = e.detail.current
      let cityList = this.state.cityList
      let currentIndex = cityIcon.findIndex(item => {
        return cityList[index].cityName && cityList[index].cityName.includes(item.city)
      })
      let currentCity = Object.assign(cityList[index], cityIcon[currentIndex])
      let time: any = new Date()
      if (time - this.state.changeStateTime > 100) {
        this.setState({
          cityIndex: index + 1,
          changeTime: new Date(),
          currentCity,
          // isEnd: false
        }, () => {
          this.props.setCurrentCity(currentCity)
        })
      }
    }
  }

  // swiperTrans = () => {
  //   this.setState({
  //     isEnd: false
  //   })
  // }

  swiperAnim = () => {
    this.setState({
      isEnd: true
    })
  }

  clickRecommend = (item, index) => {
    let canTo = false
    if (item.toUrl && item.toUrl.split('-')[0] === 'rankinglist') {
      let city = this.props.positionCity
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
    

}

export default HasDistanceTopSec
