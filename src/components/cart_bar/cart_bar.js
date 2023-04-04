import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Button, Image, Text } from '@tarojs/components'
import { connect } from 'react-redux'

// css image
import cartIcon from '@/static/img/createOrder/cart.png'

import './cart_bar.scss'

@connect(({counter}) => (
  {...counter}
))
class CartBar extends Component {

  constructor(props) {
    super(props);
  }

  UNSAFE_componentWillMount () { }

  componentDidMount () { }

  render () {
    return (
      <View className='cart-bar'>
        <View className='cart-btn-container'>
          <View className='content'>
            {
              this.props.isShowCartIcon &&
              <View className='cart-icon-container' onClick={this.props.openCart}>
                <Image src={cartIcon} mode='aspectFit' />
                <Text className='num'>{this.props.totalNum}</Text>
              </View>
            }
            <View className='price'>
              ￥<Text>{this.props.cost || this.props.totalPrice}</Text>
              {
                this.props.discountTotalPrice > 0 &&
                <Text className='discount'>（已优惠¥{this.props.discountTotalPrice > 5 ? 5 : this.props.discountTotalPrice}）</Text>
              }
            </View>
          </View>
          <Button className='btn' onClick={this.props.toCreateOrder}>去结算</Button>
        </View>
      </View>
    )
  }
}

CartBar.defaultProps = {
  totalNum: 0,
  cost: 0,
  discountTotalPrice: 0,
  isShowCartIcon: true,
  openCart() {
    return;
  },
  toCreateOrder() {
    // 正常流程下，从商品列表页到创建订单页面
    if (this.props.selectedGoodsList.length) {
      Taro.navigateTo({url: '/pages/createOrder/index'});
    } else {
      Taro.showToast({title: '您还未选择商品！', icon: 'none', duration: 1500, mask: true});
    }
  }
}

export default CartBar;
