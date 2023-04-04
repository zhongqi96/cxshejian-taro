import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Button, Text, Image } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import API from '@/api'

import moment from 'dayjs'

import { resetGoodsAndPrice } from '@/store/actions'


import failIcon from '@/static/img/createOrder/pay_fail.png'
import successIcon from '@/static/img/createOrder/pay_success.png'
import './index.scss'

type PageStateProps = {
  totalPrice: number,
  num: number
}

type PageDispatchProps = {
  resetGoodsAndPrice: () => void
}

type PageOwnProps = {}

type PageState = {
  payResult: boolean,
  orderId: string,
  pageAd: any
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface PayResult {
  props: IProps;
}

@connect(({ counter }) => ({
  ...counter
}), (dispatch) => ({
  resetGoodsAndPrice() {
    dispatch(resetGoodsAndPrice)
  }
}))
class PayResult extends Component {

  state: PageState = {
    payResult: true,
    orderId: '',
    pageAd: {}
  }

  UNSAFE_componentWillMount() {
    // 判断支付接口
    let router: any = getCurrentInstance().router
    let orderId = router.params.orderId || ''
    orderId && this.setState({
      orderId,
      payResult: !orderId
    })
    Taro.setNavigationBarTitle({
      title: orderId ? '支付失败' : '支付成功'
    })

    // 获取广告图
    this.getAdData()
  }

  componentWillUnmount () { }

  componentDidShow () {

  }

  componentDidHide () { }

  render () {
    const { payResult, pageAd } = this.state
    return (
      <View className='pay-result'>
        <Image src={payResult ? successIcon : failIcon} className='success-icon' mode="aspectFill"> </Image>
        <View className={`tip ${!payResult && 'fail'}`}>{payResult ? '订单已经支付成功!' : '很抱歉,支付失败!'}</View>
        {payResult && <View className='sub-tip'>感谢您的购买!</View>}
        {
          payResult && <View className='pay-info'>
            <View className='price'>支付金额：<Text>￥{this.props.totalPrice}</Text></View>
            <View className='time'>支付时间：<Text>{moment().format('YYYY-MM-DD HH:mm:ss')}</Text></View>
          </View>
        }
        {
          !payResult && <View>
          <Button className='btn order-fail' onClick={this.toOrderList}>查看订单</Button>
          <Button className='btn pay' onClick={this.rePay}>重新支付</Button>
        </View>
        }
        {
          payResult && <View>
            <Button className='btn back' onClick={this.backToIndex}>返回首页</Button>
            <Button className='btn order' onClick={this.toOrderList}>查看订单</Button>
          </View>
        }

        {pageAd.imageUrl && <Image src={pageAd.imageUrl} className='ad-img' mode='aspectFill' onClick={this.toAd}></Image>}
      </View>
    )
  }

  getAdData = () => {
    // 广告标识code定义
    // 首页顶部：home-head
    // 首页中部：home-middle
    // 下单支付成功页面：pay-success
    // 车厢美食：train-banner
    API.Home.getAdData({code: 'pay-success'})
      .then(res => {
        let bannerImgList = res.data.bannerImgList || []
        this.setState({
          pageAd: bannerImgList[0]
        })
      })
  }

  toAd = () => {
    let ad = this.state.pageAd
    if (+ad.linkType === 1 && ad.toUrl) {
      ad.toUrl && Taro.navigateTo({
        url: `/pages/adPage/index?url=${ad.toUrl}`
      })
    }
  }

  toOrderList = () => {
    this.props.resetGoodsAndPrice()
    Taro.redirectTo({url: '/pages/orderList/index'})
  }

  rePay = () => {
    let data = {
      orderId: this.state.orderId,
      tradeType: 'WX_JSAPI',
      userId: ''
    }
    API.Order.createPayment(data)
      .then(res => {
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
          fail (payResult) {
            console.log(payResult)
          }
        })
      })
  }

  backToIndex = () => {
    this.props.resetGoodsAndPrice()
    Taro.switchTab({url: '/pages/index/index'})
  }
}

export default PayResult

