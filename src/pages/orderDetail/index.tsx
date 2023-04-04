import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import {View, Text, Image, Button, Block} from '@tarojs/components'
import { connect } from 'react-redux'
import moment from 'dayjs'
import API from '@/api'

// component
import CartBar from '@/components/cart_bar/cart_bar'

// css image
import './index.scss'
import positionIcon from '@/static/img/order/position.png'

// redux
import { setTotalPrice } from "@/store/actions"
import Order from "../../common/Order";

//订单状态 0:已下单;1:已支付;2:已接单;3:已完成;4:已取消;5:已关闭;-1:已作废
const STATUS_TIP = ['待付款', '待收货', '待收货', '已完成', '已取消', '已关闭', '支付超时'];

interface State {
  orderDetail: Order | null;
  timer: any;
  orderTime: string;
}

@connect(({ reducers }) => (
  { ...reducers }
), (dispatch) => ({
  setTotalPrice(payload) {
    dispatch(setTotalPrice(payload));
  }
}))
export default class OrderDetail extends Component<any, > {

  state: State = {
    orderDetail: null,
    timer: null,
    orderTime: ''
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount() {
    if (this.state.timer) {
      clearInterval(this.state.timer);
    }
  }

  componentDidShow () {
    this.getOrderDetail();
  }

  getOrderDetail = () => {
    const router = getCurrentInstance().router;

    if (router) {
      let params = {
        id: +router.params.orderId
      }
      API.Order.getOrderDetail(params).then(order => {
        if (order.code === 1) {
          this.setState({orderDetail: order.data}, () => {
            this.startCountdown();
          });
        } else {
          Taro.showToast({ title: order.message, icon: "none", duration: 1500, mask: true });
        }
      }).catch(() => Taro.showToast({ title: '获取订单信息失败', icon: "none", duration: 1500, mask: true }));
    }
  }

  // 执行支付倒计时
  startCountdown = () => {
    clearInterval(this.state.timer);
    // 当订单不是待付款状态，取消倒计时
    if (this.state.orderDetail.status !== 0) {
      return;
    }
    // 获取订单结束时间的时间戳(秒)
    const orderEndTime = moment(this.state.orderDetail.endTime).unix();
    let now = moment().unix() + 2; // 延长两秒
    //  当订单付款时间没到，启动定时器
    if (orderEndTime > now) {
      let timer = setInterval(() => {
        now = moment().unix() + 2;
        if (orderEndTime > now) {
          let diffTime = orderEndTime - now;
          this.setState({
            orderTime: moment.unix(diffTime).format('mm分ss秒')
          });
        } else {
          clearInterval(this.state.timer);
          this.setState({
            orderDetail: {
              ...this.state.orderDetail,
              status: -1
            }
          });
        }
      }, 1000);
      this.setState({timer});
    } else {
      // 如果订单付款时间过了，改变订单状态，清除定时器
      clearInterval(this.state.timer);
      this.setState({
        orderDetail: {
          ...this.state.orderDetail,
          status: -1
        }
      });
    }
  }

  // 重新发起支付
  rePay = () => {
    if (this.state.timer) {
      clearInterval(this.state.timer);
    }
    this.props.setTotalPrice(this.state.orderDetail.totalPrice);
    // this.payService.pay(this.state.orderDetail, this.state.orderDetail.train);
  }

  // 去发票页
  // toInvoice = () => {
  //   Taro.navigateTo({
  //     url: `/pages/order/invoice/invoice` +
  //       `?billId=${this.state.orderDetail.billId}` +
  //       `&isInvoice=${this.state.orderDetail.isInvoice ? 1 : 0}` +
  //       `&price=${this.state.orderDetail.money}`
  //   });
  // }

  render () {
    const { orderDetail } = this.state;

    // 计算商品数量
    let totalNum = 0;
    let orderList = orderDetail && orderDetail['orderList'] || [];
    orderList.forEach(goods => {
      totalNum += goods.quantity;
    });

    return (
      <View className='order-detail'>
        {
          orderDetail &&
          <Block>
            <View className='header'>
              {
                orderDetail && orderDetail.status === 0
                  ?
                  <Text>{this.state.orderTime}后订单失效</Text>
                  :
                  <Text />
              }
              <Text className='order-status'>{STATUS_TIP[orderDetail.status] || '支付超时'}</Text>
            </View>

            <View className='order-info-container'>
              <View className='order-position'>
                <View className='icon'>
                  <Image src={positionIcon} />
                </View>
                <View className='position-info'>
                  <View className='user-info'>
                    <Text>{orderDetail.receiver}</Text>
                    <Text>{orderDetail.mobile}</Text>
                  </View>
                  <View className='train-info'>
                    {orderDetail.address}
                  </View>
                </View>
              </View>
              <View className='order-item-container'>
                {
                  orderDetail.orderList.map((item, idx) => {
                    return (
                      <View className='order-item' key={idx}>
                        <View className='product-img'>
                          <Image src={item.thumbImg} />
                        </View>
                        <View className='product-info'>
                          <View className='name'>{item.productName}</View>
                          <View className='price-container'>
                            <Text className='price'>￥{item.price / 100}/份</Text>
                            <Text className='num'>x{item.quantity}</Text>
                          </View>
                        </View>
                      </View>
                    )
                  })
                }
                {/* <View className='num-of-tableware'>
              <Text>餐具数量</Text>
              <Text>x{this.state.orderDetail.orderlist.length}</Text>
            </View> */}
              </View>
              <View className='order-info'>
                <View className='title'>订单详情</View>
                {/*<View className='order-info-item'>*/}
                {/*  <Text>商品金额（共{totalNum}件）</Text>*/}
                {/*  <Text className='price'>￥{this.state.orderDetail.totalprice}</Text>*/}
                {/*</View>*/}
                {/*<View className='order-info-item'>*/}
                {/*  <Text>活动优惠</Text>*/}
                {/*  <Text className='price'>-￥{this.state.orderDetail.discount_price}</Text>*/}
                {/*</View>*/}
                <View className='order-info-item'>
                  <Text>订单编号</Text>
                  <Text>{orderDetail.orderNumber}</Text>
                </View>
                <View className='order-info-item'>
                  <Text>下单时间</Text>
                  <Text>{orderDetail.orderTime}</Text>
                </View>
                <View className='order-info-item'>
                  <Text>备注</Text>
                  <View>{orderDetail.memo}</View>
                </View>
                <View className='order-info-item'>
                  <Text />
                  <View>合计：
                    <Text className='price'>
                      ￥{orderDetail.settlementAmount / 100}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {
              // this.state.orderDetail.status === 3 && this.state.orderDetail.isShowInvoice &&
              // <View className='invoice-btn-container'>
              //   <Button className='invoice-btn' onClick={this.toInvoice}>
              //     {
              //       this.state.orderDetail.isInvoice
              //         ?
              //         <Text>查看发票</Text>
              //         :
              //         <Text>开具发票</Text>
              //     }
              //   </Button>
              // </View>
            }

            {
              (orderDetail.payStatus === 0 && orderDetail.status === 0) &&
              <View className='cart-bar'>
                <CartBar
                  isShowCartIcon={false}
                  totalNum={totalNum}
                  selectedGoodsList={orderDetail.orderList}
                  totalPrice={orderDetail.settlementAmount / 100}
                  toCreateOrder={this.rePay}
                />
              </View>
            }
          </Block>
        }
      </View>
    )
  }
}
