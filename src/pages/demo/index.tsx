import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, ScrollView, WebView, Text } from '@tarojs/components'

// import { add, minus, asyncAdd } from '../../store/actions'

import './index.scss'

type PageStateProps = {

}

type PageDispatchProps = {

}

type PageOwnProps = {}

type PageState = {
  activeIndex: number,
  tabList: Array<string>,
  scrollNow: string,
  url: string,
  cityTempList: Array<any>,
  cityList: Array<any>
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Demo {
  props: IProps;
}

@connect(({ counter }) => ({
  ...counter
}), () => ({

}))
class Demo extends Component {
  state: PageState = {
    activeIndex: 0,
    tabList: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    scrollNow: 'a',
    cityTempList: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    cityList: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    url: 'https://www.baidu.com'
  }


  UNSAFE_componentWillMount() {

  }


  componentDidShow () {

  }

  componentDidHide () { }

  render () {
    const { tabList, activeIndex, scrollNow, url, cityTempList, cityList } = this.state
    return (
      <View className='demo'>
        {/*<WebView src={url}></WebView>*/}
        <ScrollView className='tab-box' scrollX scrollIntoView={'item'+activeIndex} scrollWithAnimation>
          {
            tabList.map((item, index) => {
              return <View className={`tab-item ${activeIndex === index && 'active'}`} key={'item'+index} id={'item'+index} onClick={() => {this.changeTab(index)}}>{item}</View>
            })
          }


        </ScrollView>

        <View className='road-city'>
            {/*<View className='name'>途经城市好物推荐</View>*/}
            <Text className='city-context'>{cityList[0]}</Text>
            <View className="city begin-city">
              <View className="city-icon"></View>
              <Text className="city-name">{cityList[0]}</Text>
            </View>
            <View className="city-scroll-box">
              {/* <View className='city-list' style={{width: 140 * cityList.length+'rpx', transform: `translateX(-${(cityIndex - 1) * 140 - 20}rpx)`}}> */}
              <ScrollView className='city-list' scrollX>
                {
                  cityTempList.map((item, index) => {
                    return (
                      <View className={`city`} key={'city'+index}>
                        {item}
                      </View>
                    )
                  })
                }
              </ScrollView>
            </View>

            <View className="city end-city">
              <View className="city-icon"></View>
              <Text className="city-name">{cityList[cityList.length-1]}</Text>
            </View>
          </View>

      </View>
    )
  }

  changeTab(index) {
    // let select = Taro.createSelectorQuery()
    // let tabItem =
    this.setState({
      activeIndex: index
    })
  }
}

export default Demo

