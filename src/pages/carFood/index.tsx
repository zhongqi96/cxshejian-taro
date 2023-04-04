import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Image, Text } from '@tarojs/components'
import API from '@/api'

import addIcon from '@/static/img/goodsList/add.png'
import subIcon from '@/static/img/goodsList/sub.png'
import shoppingCart from '@/static/img/goodsList/shopping-cart.png'
import clear from '@/static/img/goodsList/clear.png'

import {
  addGoods,
  setTotalPrice,
  resetGoodsAndPrice
} from '@/store/actions'

import './index.scss'

type PageStateProps = {
  trainInfo: any,
  date: string,
  userStationInfo: any
}

type PageDispatchProps = {
  addGoods: (any) => any
  setTotalPrice: (any) => any
  resetGoodsAndPrice: () => void
}

type PageOwnProps = {}

type PageState = {
  topAd: any[],
  goodsList: any[],
  showBg: boolean,
  cartGoods: any[]
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface CarFood {
  props: IProps;
}


@connect(({ counter }) => ({
  ...counter
}), (dispatch) => ({
  addGoods(payload) {
    dispatch(addGoods(payload));
  },
  setTotalPrice(payload) {
    dispatch(setTotalPrice(payload));
  },
  resetGoodsAndPrice() {
    dispatch(resetGoodsAndPrice())
  }
}))

class CarFood extends Component {

  state: PageState = {
    topAd: [],
    goodsList: [],
    showBg: false,
    cartGoods: []
  }

  componentWillUnmount () { }

  componentDidShow () {
    this.getCarFood()
    this.getAdData()
  }

  componentDidHide () { }

  render () {
    const { goodsList, showBg, cartGoods, topAd } = this.state
    const { trainInfo } = this.props
    return (
      <View className='car-food'>
        <View className='content'>
          {topAd[0] && <Image src={topAd[0] && topAd[0].imageUrl} mode='aspectFill' className='topImg'> </Image>}
          <Text className='list-title'>{trainInfo.train}车次商品推荐</Text>
          {/*-----商品列表------*/}
          {
            goodsList.map((item, index) => {
              return (
                <View className='goods-box' key={'box'+index}>
                  {
                    item.map((goods, i) => {
                      return (
                        <View className='goods-item' key={'goods'+i}>
                          <Image src={goods.thumbImg} className='goods-img' mode='aspectFill'> </Image>
                          <Text className='goods-title'>{goods.productName}</Text>
                          <View className='goods-msg'>
                            <Text className='goods-price'>¥{(goods.price/100).toFixed(2)}</Text>
                            <Image src={addIcon} className='add-icon' mode="aspectFill" onClick={() => this.addGoods(goods)}></Image>
                          </View>
                        </View>
                      )
                    })
                  }
                </View>
              )
            })
          }


        {/*-----底部功能区-----*/}
        <View className='bottom-handle'>
          <View className='shopping-cart-box' onClick={this.showBuy}>
            <Image src={shoppingCart} className='shopping-cart-icon'></Image>
            <Text className='cart-goods-num'>{this.cartGoodsNumber()}</Text>
          </View>
          <Text className='total-money'>
            <Text className='unit'>¥</Text>
            {this.totalMoney()}
          </Text>
          <Text className='sumit-button' onClick={this.toAccount}>结算</Text>

        </View>

        {/*-----购物车列表-----*/}
        <View className={`buy-bg ${showBg && 'active'}`} onClick={this.hideBuy}>
          <View className={`shopping-cart ${showBg && 'active'}`} onClick={e => e.stopPropagation()}>
            <View className='cart-title'>
              <Text className='title'>购物车</Text>
              <View className='clear' onClick={this.clearCart}>
                <Image src={clear} className='clear-icon'></Image>
                <Text className='clear-text'>清空</Text>
              </View>
            </View>

            {
              cartGoods.map((item, index) => {
                return (
                  <View className='cart-goods-item' key={'cart'+index}>
                    <Text className='goods-name'>{item.productName}</Text>
                    <Text className='price'>¥{(item.price/100).toFixed(2)}</Text>
                    <View className='number-handle'>
                      <Image src={subIcon} className='sub-icon' onClick={() => this.changeGoodsNumber(item, 'sub')}></Image>
                      <Text className='number'>{item.number}</Text>
                      <Image src={addIcon} className='add-icon' onClick={() => this.changeGoodsNumber(item, 'add')}></Image>
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

  getAdData = () => {
    // 广告标识code定义
    // 首页顶部：home-head
    // 首页中部：home-middle
    // 下单支付成功页面：pay-success
    // 车厢美食：train-banner
    API.Home.getAdData({code: 'train-banner'})
      .then(res => {
        let banner: [] = res.data.bannerImgList || []
        this.setState({
          topAd: banner,
        })
      })
  }

  // 获取商品列表
  getCarFood = () => {
    let data = {
      carriageRange: '',
      train: this.props.trainInfo.train,
      trainDate: this.props.date
    }
    API.CarFood.getCarData(data)
      .then(res => {
        let cid = this.props.trainInfo.cid // 大小车厢标识
        let products = (res.data && res.data[cid === 'A' ? 'frontTrainProducts' : 'backTrainProducts']) || []
        let arr = products.map(item => {
          return item.products.slice(0, 3)
        })
        this.setState({
          goodsList: arr
        })
      })
  }

  // 添加商品到购物车
  addGoods = (goods) => {
    let cartGoods = this.state.cartGoods
    let index = cartGoods.findIndex(item => {
      return item.productId === goods.productId
    })
    if (index > -1) {
      cartGoods[index].number++
      if (cartGoods[index].number > goods.quantity) {
        Taro.showToast({
          title: '库存不足',
          icon: 'none'
        })
        return
      }
    } else {
      if (goods.quantity > 0) {
        goods.number = 1
        cartGoods.push(goods)
      }
    }
    this.setState({
      cartGoods
    })
  }

  // 清空购物车
  clearCart = () => {
    this.props.resetGoodsAndPrice()
    this.setState({
      cartGoods: []
    })
  }

  // 显示隐藏购物车列表
  showBuy = () => {
    this.setState({
      showBg: true
    })
  }
  hideBuy = () => {
    this.setState({
      showBg: false
    })
  }

  // 计算总价
  totalMoney = () => {
    let total: number = 0
    let goodsList: any[] = this.state.cartGoods
    goodsList.forEach(item => {
      let price: number = item.price * 1
      total = total + item.number * price
    })
    return (total / 100).toFixed(2)
  }

  // 购物车商品总数
  cartGoodsNumber() {
    let number = 0
    let goodsList: any[] = this.state.cartGoods
    goodsList.forEach(item => {
      number += item.number
    })
    return number
  }

  // 跳转到提交订单页
  toAccount = () => {
    let cartGoods = this.state.cartGoods
    if (cartGoods.length === 0) {
      Taro.showToast({
        title: '请添加商品',
        icon: 'none'
      })
      return
    }
    cartGoods = cartGoods.filter(item => {
      return +item.number > 0
    })
    this.props.setTotalPrice(this.totalMoney())
    this.props.addGoods(cartGoods)
    // Taro.setStorageSync('goods', this.state.cartGoods)
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

  // 修改购物车商品数量
  changeGoodsNumber = (item, type) => {
    // event.stopPropagation()
    let cartGoods: any[] = this.state.cartGoods
    let index = cartGoods.findIndex(goods => {
      return goods.productId === item.productId
    })
    if (type === 'add' && item.quantity > cartGoods[index].number) {
      cartGoods[index].number++
    }
    if (type === 'sub' && cartGoods[index].number > 0) {
      cartGoods[index].number--
    }
    this.setState({
      cartGoods
    })
  }
}

export default CarFood

